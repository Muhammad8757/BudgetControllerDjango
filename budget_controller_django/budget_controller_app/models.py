from django.db import models


class User(models.Model):
    name = models.CharField(max_length=20)
    phone_number = models.IntegerField()
    password = models.CharField(max_length=128) 


class Category(models.Model):
    name = models.CharField(max_length=15)


class UserTransaction(models.Model):
    amount = models.FloatField()
    user = models.ForeignKey(User, on_delete=models.CASCADE) 
    date = models.DateTimeField()
    description = models.CharField(max_length=150, null=True, blank=True)
    type = models.BooleanField()
    category = models.ForeignKey(Category, on_delete=models.CASCADE, null=True, blank=True)