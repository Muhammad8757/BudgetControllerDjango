# Generated by Django 5.0.6 on 2024-07-17 11:51

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('budget_controller_app', '0004_usertransaction_created_category_by_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='usertransaction',
            name='created_category_by',
        ),
        migrations.AddField(
            model_name='category',
            name='created_category_by',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='created_transactions', to='budget_controller_app.user'),
        ),
    ]
