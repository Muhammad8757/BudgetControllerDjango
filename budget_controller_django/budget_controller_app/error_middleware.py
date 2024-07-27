from django.shortcuts import render


class Error_Middleware:
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        try:
            response = self.get_response(request)
        except Exception as e:
            print(f"Error {e}")
            return render(request, "error.html")
        return response