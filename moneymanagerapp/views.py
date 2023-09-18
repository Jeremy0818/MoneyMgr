from django.shortcuts import render
from django.http import HttpResponse
from django.views import View
from django.views.generic.base import TemplateView
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from moneymanagerapp.util import ocr

class Index(TemplateView):
    template_name = 'moneymanagerapp/index.html'

@csrf_exempt  # Disable CSRF protection for this view during development
def ocrApi(request):
    if request.method == 'POST':
        image_data = request.FILES.get('image')

        if not image_data:
            return JsonResponse({'error': 'No image provided'}, status=400)

        try:
            response_data = ocr(image_data)
            return JsonResponse(response_data)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    else:
        return JsonResponse({'error': 'Invalid HTTP method'}, status=405)
