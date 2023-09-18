from django.contrib import admin

# Register your models here.
from .models import *  # Import your models

admin.site.register(Account)
admin.site.register(Label)
admin.site.register(Transaction)
admin.site.register(IncomeCategory)
admin.site.register(Income)
admin.site.register(Transfer)
admin.site.register(ExpenseCategory)
admin.site.register(Expense)
admin.site.register(Group)
admin.site.register(SharedExpense)
admin.site.register(SplitExpense)
admin.site.register(SettlementStatus)
admin.site.register(Settlement)
admin.site.register(Activity)
admin.site.register(Budget)
admin.site.register(Goal)
admin.site.register(RecurringTransaction)
admin.site.register(Reminder)