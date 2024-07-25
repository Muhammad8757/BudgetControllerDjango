from django.db import models


class User(models.Model):
    name = models.CharField(max_length=20)
    phone_number = models.IntegerField(unique=True)
    password = models.CharField(max_length=128) 


class Category(models.Model):
    name = models.CharField(max_length=15)
    created_category_by = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='created_transactions')


class UserTransaction(models.Model):
    amount = models.FloatField()
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transactions')
    date = models.DateTimeField()
    description = models.CharField(max_length=150, null=True, blank=True)
    type = models.BooleanField()
    category = models.ForeignKey(Category, on_delete=models.CASCADE, null=True, blank=True)
    