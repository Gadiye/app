# payslips/views.py
from django.shortcuts import get_object_or_404
from django.http import HttpResponse, Http404
from django.db import transaction
from django.utils import timezone
from datetime import datetime, date, timedelta
from decimal import Decimal
from django.core.files.base import ContentFile

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend

from .models import Payslip
from artisans.models import Artisan
from jobs.models import JobItem
from products.models import Product # To access SERVICE_CATEGORIES

from .serializers import (
    PayslipListSerializer,
    PayslipDetailSerializer,
    PayslipCreateUpdateSerializer,
    JobItemForPayslipSerializer, # For the /payslips/{id}/job-items/ endpoint
)
from .filters import PayslipFilter # Import the filterset

# ReportLab imports for PDF generation
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from io import BytesIO

# --- PDF Generation Function (Can be in a separate utils.py if preferred) ---
def generate_payslip_pdf(artisan, job_items, period_start, period_end, service_category=None):
    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=A4)
    p.setFont("Helvetica", 12)

    # Header
    p.drawString(50, 800, "Artisan Payslip")
    p.drawString(50, 780, f"Artisan: {artisan.name}")
    if service_category:
        p.drawString(50, 760, f"Service Category: {service_category}")
        y_offset = 740
    else:
        y_offset = 760
    p.drawString(50, y_offset, f"Period: {period_start.strftime('%Y-%m-%d')} to {period_end.strftime('%Y-%m-%d')}")

    # Table Header
    p.drawString(50, y_offset - 20, "Job ID")
    p.drawString(100, y_offset - 20, "Product")
    p.drawString(250, y_offset - 20, "Qty Ordered")
    p.drawString(320, y_offset - 20, "Qty Accepted")
    p.drawString(390, y_offset - 20, "Unit Price")
    p.drawString(460, y_offset - 20, "Final Payment")

    # Table Content
    y = y_offset - 40
    total_payment = Decimal('0.00') # Use Decimal for calculations
    for item in job_items:
        # Check if we need a new page
        if y < 100: # If less than 100 points from bottom, start new page
            p.showPage()
            p.setFont("Helvetica", 12)
            y = 800 # Reset y for new page
            # Re-draw table header on new page for continuity
            p.drawString(50, y, "Job ID")
            p.drawString(100, y, "Product")
            p.drawString(250, y, "Qty Ordered")
            p.drawString(320, y, "Qty Accepted")
            p.drawString(390, y, "Unit Price")
            p.drawString(460, y, "Final Payment")
            y -= 20 # Adjust y for first row on new page

        p.drawString(50, y, str(item.job.job_id))
        p.drawString(100, y, str(item.product))
        p.drawString(250, y, str(item.quantity_ordered))
        p.drawString(320, y, str(item.quantity_accepted))
        p.drawString(390, y, f"${getattr(item.product, 'base_price', Decimal('0.00')):.2f}") # Handle missing base_price
        p.drawString(460, y, f"${item.final_payment:.2f}")
        total_payment += item.final_payment
        y -= 20

    # Total
    if y < 100: # Ensure total doesn't get cut off on previous page
        p.showPage()
        p.setFont("Helvetica", 12)
        y = 800
    p.drawString(50, y - 20, f"Total Payment: ${total_payment:.2f}")

    p.showPage() # Ensures all content is flushed and adds final page if needed
    p.save()

    pdf_content = buffer.getvalue()
    buffer.close()
    return pdf_content, total_payment

# --- DRF Views ---

class PayslipPagination(PageNumberPagination):
    """Custom pagination for payslip lists."""
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class PayslipViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Payslip resources.
    Supports CRUD, filtering, searching, sorting, and custom actions for:
    - Downloading PDF
    - Listing associated Job Items
    - Generating new payslips from Job Items
    - Providing metadata
    """
    queryset = Payslip.objects.all().select_related('artisan') # Optimize for list/detail
    pagination_class = PayslipPagination
    permission_classes = [IsAuthenticated] # Most operations require authentication
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = PayslipFilter # Apply the custom filterset
    search_fields = ['artisan__name'] # Search by artisan name
    ordering_fields = ['generated_date', 'total_payment', 'artisan__name', 'period_start', 'period_end']
    ordering = ['-generated_date'] # Default sorting

    def get_serializer_class(self):
        if self.action == 'list':
            return PayslipListSerializer
        elif self.action == 'retrieve':
            return PayslipDetailSerializer
        elif self.action in ['create', 'update', 'partial_update', 'generate_payslip_from_jobs']:
            return PayslipCreateUpdateSerializer
        return PayslipListSerializer # Default for other actions

    def get_serializer_context(self):
        """
        Extra context for serializers.
        Used for building absolute URLs and conditional nested data.
        """
        context = super().get_serializer_context()
        if self.action == 'retrieve':
            context['include_job_items'] = self.request.query_params.get('include_job_items', 'false').lower() == 'true'
        return context

    def perform_destroy(self, instance):
        """
        Custom deletion logic: Delete associated PDF file and reset payslip_generated on JobItems.
        """
        with transaction.atomic():
            # 1. Reset payslip_generated for associated JobItems
            # This is critical. We need to identify exactly which job items
            # were part of THIS payslip. The current Payslip model doesn't store this
            # explicitly. We'll infer based on artisan, period, and if they are marked.
            # A more robust solution might link Payslip to JobItem directly (ManyToMany).
            # For now, we assume any job items marked as generated for this artisan
            # within this payslip's period should be reset.
            JobItem.objects.filter(
                artisan=instance.artisan,
                job__created_date__date__gte=instance.period_start,
                job__created_date__date__lte=instance.period_end,
                payslip_generated=True # Only reset those that were marked
            ).update(payslip_generated=False)

            # 2. Delete the PDF file from storage
            if instance.pdf_file:
                instance.pdf_file.delete(save=False) # delete the file, but don't save the model yet

            # 3. Perform model instance deletion
            instance.delete()

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def download(self, request, pk=None):
        """
        GET /api/payslips/{id}/download/
        Allows downloading the payslip's PDF file.
        """
        payslip = self.get_object()
        if not payslip.pdf_file:
            raise Http404("PDF file not found for this payslip.")

        # Ensure authorized access (e.g., admin or the artisan themselves)
        # You'll need to implement this based on your User model and Artisan relationship
        # if request.user.is_staff or request.user.artisan == payslip.artisan:
        #     pass
        # else:
        #     return Response({"detail": "You do not have permission to download this file."},
        #                     status=status.HTTP_403_FORBIDDEN)

        try:
            with payslip.pdf_file.open('rb') as pdf:
                response = HttpResponse(pdf.read(), content_type='application/pdf')
                response['Content-Disposition'] = f'attachment; filename="{payslip.pdf_file.name.split("/")[-1]}"'
                return response
        except FileNotFoundError:
            raise Http404("PDF file not found on storage.")


    @action(detail=True, methods=['get'])
    def job_items(self, request, pk=None):
        """
        GET /api/payslips/{id}/job-items/
        Retrieve a list of job items associated with the payslip.
        """
        payslip = self.get_object()
        queryset = JobItem.objects.filter(
            artisan=payslip.artisan,
            job__created_date__date__gte=payslip.period_start,
            job__created_date__date__lte=payslip.period_end,
            payslip_generated=True # Crucially, only items marked as generated
            # If you have a specific way to link job items to payslips (e.g., through an intermediary model), use that.
        ).select_related('job', 'product').order_by('-job__created_date') # Default ordering

        # Apply filtering for job items within this action
        job_id = request.query_params.get('job_id')
        if job_id:
            queryset = queryset.filter(job__job_id=job_id)

        product_id = request.query_params.get('product_id')
        if product_id:
            queryset = queryset.filter(product__id=product_id)

        # Apply pagination
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = JobItemForPayslipSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = JobItemForPayslipSerializer(queryset, many=True)
        return Response(serializer.data)


    @action(detail=False, methods=['post'], url_path='generate')
    def generate_payslip_from_jobs(self, request):
        """
        POST /api/payslips/generate/
        Generate a new payslip for an artisan based on unprocessed job items.
        """
        serializer = self.get_serializer(data=request.data) # Use PayslipCreateUpdateSerializer for input validation
        serializer.is_valid(raise_exception=True)

        artisan_id = serializer.validated_data['artisan'].id
        period_start = serializer.validated_data['period_start']
        period_end = serializer.validated_data['period_end']
        service_category = serializer.validated_data.get('service_category') # Optional

        artisan = get_object_or_404(Artisan, pk=artisan_id)

        # Ensure period_end is treated as the end of the day for range queries
        period_end_with_time = datetime.combine(period_end, datetime.max.time())

        # Find eligible job items that are not yet part of a payslip
        job_items_query = JobItem.objects.filter(
            artisan=artisan,
            job__created_date__range=[period_start, period_end_with_time],
            quantity_accepted__gt=0, # Only accepted items contribute
            payslip_generated=False # Crucial: Only process un-payslipped items
        ).select_related('job', 'product') # Preload related objects for PDF generation and payment calculation

        if service_category:
            job_items_query = job_items_query.filter(job__service_category=service_category)

        job_items = list(job_items_query) # Convert to list to use multiple times

        if not job_items:
            return Response({"detail": "No eligible job items found to generate a payslip for this period and artisan."},
                            status=status.HTTP_200_OK) # Or 404/400, depending on desired strictness

        # Calculate total payment
        total_payment = sum(item.final_payment for item in job_items)

        # Generate PDF content
        pdf_content, _ = generate_payslip_pdf(artisan, job_items, period_start, period_end, service_category)

        with transaction.atomic():
            # Create Payslip record
            payslip = Payslip.objects.create(
                artisan=artisan,
                service_category=service_category, # Will be null if not provided
                total_payment=total_payment,
                period_start=period_start,
                period_end=period_end,
                # pdf_file will be saved next
            )
            # Save PDF file to the Payslip instance
            pdf_filename = f"payslips/{artisan.name.replace(' ', '_')}_{period_start.strftime('%Y%m%d')}_{period_end.strftime('%Y%m%d')}_{payslip.pk}.pdf"
            payslip.pdf_file.save(pdf_filename, ContentFile(pdf_content), save=True)

            # Mark processed JobItems as payslip_generated
            job_item_ids = [item.id for item in job_items]
            JobItem.objects.filter(id__in=job_item_ids).update(payslip_generated=True)

        # Return the created payslip data
        response_serializer = PayslipListSerializer(payslip, context={'request': request})
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)


    @action(detail=False, methods=['get'])
    def metadata(self, request):
        """
        GET /api/payslips/metadata/
        Provides metadata for payslip-related operations.
        """
        metadata = {
            "service_categories": [
                {"value": choice[0], "label": choice[1]} for choice in Product.SERVICE_CATEGORIES
            ],
            "filterable_fields": [
                "artisan", "service_category", "period_start_gte", "period_end_lte",
                "generated_date_gte", "generated_date_lte", "artisan_name"
            ],
            "sortable_fields": self.ordering_fields,
            "search_fields": self.search_fields,
            "date_format": "YYYY-MM-DD",
            "pdf_upload_formats": ["base64-encoded-pdf", "multipart-form-data-pdf"]
        }
        return Response(metadata, status=status.HTTP_200_OK)