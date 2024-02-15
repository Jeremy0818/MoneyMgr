from PIL import Image, ImageEnhance, ImageFilter, ImageDraw
import pytesseract
import re
import base64
import io
import cv2
import numpy as np
import concurrent.futures
import enchant
from datetime import datetime, date
from dateutil import parser
from .models import Transaction
from .serializers import TransactionSerializer

def ocr(image_data):
    img = Image.open(image_data)
    img = detect_boundary(img)
    img = preprocess_image(img)

    # Recognize text using OpenCV and Tesseract
    recognized_text, processed_image = recognize_text(img, config='--psm 6 --oem 3')
    # Extract receipt information
    receipt_info = extract_receipt_info(recognized_text)

    data = handle_extracted_info(receipt_info['total_amount'], receipt_info['date_paid'])
    serializer = TransactionSerializer(data, many=True)
    serialized_data = serializer.data

    # Create a JSON response
    response_data = {
        'data': serialized_data
    }
    return response_data

# Define preprocessing function
def preprocess_image(img):
    # Resize the image for consistent processing
    max_size = (1000, 1000)
    img.thumbnail(max_size, Image.LANCZOS)

    # Enhance image contrast and brightness (adjust parameters as needed)
    enhancer = ImageEnhance.Contrast(img)
    img = enhancer.enhance(2.0)  # Increase contrast

    # Apply Gaussian blur to reduce noise (adjust radius as needed)
    img = img.filter(ImageFilter.GaussianBlur(radius=0.5))

    return img

def preprocess(image):
    """
    Preprocess the receipt image without NAp.

    Args:
        image: The receipt image in OpenCV format.

    Returns:
        The preprocessed image and extracted text lines (optional).
    """
    # Convert to grayscale (if necessary)
    if len(image.shape) > 2:
        grayscale_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    else:
        grayscale_image = image.copy()
    
    WIN_SIZE = (7, 7)
    # Apply blur for noise reduction (optional)
    blurred_image = cv2.GaussianBlur(grayscale_image, WIN_SIZE, 0.)

    # Apply CLAHE
    clahe = cv2.createCLAHE(clipLimit=0.6, tileGridSize=WIN_SIZE)
    clahe_image = clahe.apply(blurred_image)

    # Apply Otsu's Binarization to get global threshold
    otsu_thresh_value, otsu_thresh = cv2.threshold(clahe_image, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    binary_image = cv2.adaptiveThreshold(otsu_thresh, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                            cv2.THRESH_BINARY, 5, 0.5)

    # # Define the kernel for morphological operations
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, WIN_SIZE)

    # # Decision logic for applying morphological operations
    morpho_image = cv2.morphologyEx(binary_image, cv2.MORPH_OPEN, kernel)

    # Bilateral filter to reduce noise while keeping edges sharp
    filtered_image = cv2.bilateralFilter(morpho_image, 11, 17, 17)

    return filtered_image

def recognize_text(image, config='--psm 6 --oem 3 -c tessedit_char_whitelist=0123456789'):
    # Detect text regions using OpenCV
    print("Start detecting text regions...")
    text_regions, processed_image = detect_text_regions(image)
    print("Completed")

    # Initialize an empty result text
    result_text = ""

    print("Start recognizing text...")
    # Recognize text in parallel for each region
    with concurrent.futures.ThreadPoolExecutor() as executor:
        future_to_region = {executor.submit(perform_ocr, image, roi, config): roi for roi in text_regions}
        for future in concurrent.futures.as_completed(future_to_region):
            region_text = future.result()
            result_text += region_text  # Append recognized text from this region to the result
    print("Completed")
    # Clean up the recognized text
    # result_text = clean_text(result_text)
    result_text = correct_ocr_errors(result_text)
    # result_text = filter_short_words(result_text)
    # result_text = filter_nonexistent_words(result_text)

    # print("Result: ", result_text)
    return result_text, processed_image

def clean_text(text):
    # Keep only alphanumeric characters and spaces
    # cleaned_text = re.sub(r'[^a-zA-Z0-9\s]', '', text)
    cleaned_text = re.sub(r'\s+', ' ', text).strip()  # Replace multiple spaces with a single space
    return cleaned_text

def correct_ocr_errors(text):
    error_corrections = {
        # '4': 'A',
        'O': '0',
        ',': '.',
        # '|': 'I',
        # Add more corrections as needed
    }
    for error, correction in error_corrections.items():
        text = text.replace(error, correction)
    return text

def filter_short_words(text, min_length=3):
    words = text.split('\n')
    filtered_words = [word for word in words if len(word) >= min_length]
    return '\n'.join(filtered_words)

def filter_nonexistent_words(text, min_length=3):
    # Initialize an English dictionary
    english_dict = enchant.Dict("en_US")

    # Split the text into words
    words = text.split()

    # Filter out words that are too short or do not exist in the dictionary
    filtered_words = [word for word in words if (len(word) >= min_length and english_dict.check(word)) or (word.replace('.', '').isdigit() or word.replace('-', '').isdigit())]

    # Rejoin the filtered words into a string
    filtered_text = ' '.join(filtered_words)

    return filtered_text

def perform_ocr(image, coordinates, config):
    x, y, w, h = coordinates
    
    # Create a sub-image (ROI) from the main image using coordinates
    roi_image = image.crop((x, y, x + w, y + h))
    
    # Perform OCR on the region of interest
    region_text = pytesseract.image_to_string(roi_image, config=config)
    # print(region_text)
    # print("Next-----------------------")
    return region_text

def detect_text_regions(image):
    # You can use OpenCV to detect text regions using contour detection
    # Implement custom logic to filter and refine text regions based on your needs
    # This example uses a simple approach by detecting contours

    processed_image = np.array(image)

    gray = cv2.cvtColor(processed_image, cv2.COLOR_BGR2GRAY)
    _, binary_image = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    # Find contours in the binary image
    contours, _ = cv2.findContours(binary_image, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    # Filter and refine contours based on area, aspect ratio, etc.
    # Implement custom logic to identify text regions
    min_area = 500  # Minimum contour area to consider
    text_regions = []

    for contour in contours:
        x, y, w, h = cv2.boundingRect(contour)
        if w * h > min_area:
            text_regions.append((x, y, w, h))
            cv2.rectangle(processed_image, (x, y), (x + w, y + h), (0, 255, 0), 2)  # Draw a green rectangle around the text region

    return text_regions, Image.fromarray(processed_image)

def extract_receipt_info(recognized_text):
    # Extract total amounts using a flexible numeric pattern with a required decimal point
    # total_amount_pattern = r'\b(\d+\.\d+)\b'  # Matches digits with a required decimal point
    # total_amount_pattern = r'\b(?:[+-]?\s*)?(?:RM|\$|€|£|¥)?\s?(\d+(?:,\d{3})*(?:\.\d{2})?)\b'
    # total_amount_pattern = r'\b(?:[+-]?\s*)?(?:RM|\$|€|£|¥)?\s?(\d+(?:,\d{3})*\.\d{2})\b'
    total_amount_pattern = r'(?:[+-]?\s*)?(?:RM|\$|€|£|¥)?\s?(\d{1,3}(?:.\d{3})*(?:\.\d{2}))\b'

    # Updated regex pattern to capture the entire line containing the total amount
    total_amount_text_pattern = r'^(.*\b(?:[+-]?\s*)?(?:RM|\$|€|£|¥)?\s?(\d+(?:,\d{3})*(?:\.\d{2})?)\b.*)$'
    total_amount_text_matches = re.findall(total_amount_text_pattern, recognized_text, re.MULTILINE)
    total_amount_matches = [item for item in [(re.sub(r'\b(RM|MYR)\b', '', re.sub(r'[0-9$€£¥.,~"\']', '', item[0])), re.findall(total_amount_pattern, item[0])) for item in total_amount_text_matches] if len(item[1]) > 0]
    
    # Extract dates using a more flexible date pattern
    # date_pattern = r'(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})|(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{2,4})'
    # date_pattern = r'(\d{1,2}[-/]\d{1,2}(?:[-/]\d{2,4})?)|(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)(?:\s+\d{2,4})?)'
    date_pattern = r'\b(\d{1,2}[-/]\d{1,2}(?:[-/]\d{2,4})?)\b|\b(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)(?:\s+\d{2,4})?)\b|\b((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}.?\s+\d{4})\b'

    # Matches various date formats like DD/MM/YYYY, DD-MM-YYYY, MM/DD/YYYY, DD Mon YYYY (e.g., 10 Sep 23)
    date_matches = re.findall(date_pattern, recognized_text)
    date_matches = [dateX for dates in date_matches for dateX in dates if dateX != '']

    # Extract merchant names using a flexible pattern
    merchant_name_pattern = r'Merchant|Retailer\s*:\s*(.*?)\n'
    merchant_name_matches = re.findall(merchant_name_pattern, recognized_text, re.I)

    return {
        'total_amount': total_amount_matches,
        'date_paid': date_matches,
        'merchant_name': merchant_name_matches,
    }

def handle_extracted_info(amounts, dates):
    # Create a list to store the Expense instances
    transactions = []
    print(len(amounts))
    print(len(dates))
    for i in range(len(amounts)):
        print("Amount title: ", amounts[i][0])
        print("Amount: ", amounts[i][1][0].rsplit('.', 1)[0].replace('.', '') + '.' + amounts[i][1][0].rsplit('.', 1)[1])

        data = {
            'title': amounts[i][0],
            'date': parser.parse(dates[i]) if i < len(dates) else date.today(),
            'total_amount': amounts[i][1][0].rsplit('.', 1)[0].replace('.', '') + '.' + amounts[i][1][0].rsplit('.', 1)[1],
        }
        transasction_instance = Transaction(**data)
        transactions.append(transasction_instance)
    return transactions

def detect_boundary(image):
    new_image = np.array(image)
    # Convert the image to grayscale
    gray_image = cv2.cvtColor(new_image, cv2.COLOR_BGR2GRAY)

    # Bilateral filter to reduce noise while keeping edges sharp
    filtered_image = cv2.bilateralFilter(gray_image, 11, 17, 17)

    # Use Canny Edge Detection to find the edges
    edges = cv2.Canny(filtered_image, 30, 200)

    # Dilate the edges to close gaps
    dilated_edges = cv2.dilate(edges, np.ones((5,5), np.uint8), iterations=1)

    # Find contours in the edged image
    contours, _ = cv2.findContours(dilated_edges.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    # Sort contours by area and remove small ones
    contours = sorted(contours, key=cv2.contourArea, reverse=True)[:10]
    contour_image = new_image.copy()
    cv2.drawContours(contour_image, contours, -1, (0,255,0), 3)

    # Assume the largest contour is the receipt. Get its bounding box and crop the image to that region
    if contours:
        # # Find the rotated rectangle of the largest contour
        rect = cv2.minAreaRect(contours[0])
        box = cv2.boxPoints(rect)
        box = np.intp(box)
        # Calculate the area of the rectangle
        width = int(rect[1][0])
        height = int(rect[1][1])
        rectangle_area = width * height

        # Calculate the area of the original image
        image_area = new_image.shape[0] * new_image.shape[1]
        print(rectangle_area/image_area)

        # Check if the rectangle's area is at least 35% of the original image's area
        if rectangle_area >= 0.35 * image_area:
            # Order the box points: top-left, top-right, bottom-right, bottom-left
            box = sorted(box, key=lambda x: x[0])  # Sort by x coordinate
            # Now we have left-most and right-most, need to sort by y
            left_most = box[:2]  # These are the left-most points
            right_most = box[2:]  # These are the right-most points

            # Sort the left-most coordinates according to their y-coordinates
            # so we can grab the top-left and bottom-left points, respectively
            left_most = sorted(left_most, key=lambda x: x[1])
            (tl, bl) = left_most

            # Now we need to sort the right-most points to grab the top-right and bottom-right
            right_most = sorted(right_most, key=lambda x: x[1])
            (tr, br) = right_most

            # Now our points are in order and we can use them for perspective transformation
            src_pts = np.array([tl, tr, br, bl], dtype="float32")

            # Width of the new image will be the maximum distance between bottom-right and bottom-left
            # x-coordinates or the top-right and top-left x-coordinates
            widthA = np.linalg.norm(br - bl)
            widthB = np.linalg.norm(tr - tl)
            maxWidth = max(int(widthA), int(widthB))

            # Height of the new image will be the maximum distance between the top-right and bottom-right
            # y-coordinates or the top-left and bottom-left y-coordinates
            heightA = np.linalg.norm(tr - br)
            heightB = np.linalg.norm(tl - bl)
            maxHeight = max(int(heightA), int(heightB))

            # Now that we have the dimensions of the new image, construct
            # the set of destination points to obtain a "birds eye view",
            # (i.e. top-down view) of the image, again specifying points
            # in the top-left, top-right, bottom-right, and bottom-left order
            dst_pts = np.array([
                [0, 0],
                [maxWidth - 1, 0],
                [maxWidth - 1, maxHeight - 1],
                [0, maxHeight - 1]
            ], dtype="float32")

            # Compute the perspective transform matrix and then apply it
            M = cv2.getPerspectiveTransform(src_pts, dst_pts)
            warped = cv2.warpPerspective(new_image, M, (maxWidth, maxHeight))
        else:
            print("Smaller than 60%")
            warped = new_image
    else:
        warped = new_image
    return Image.fromarray(warped)