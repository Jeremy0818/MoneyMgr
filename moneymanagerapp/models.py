from django.db import models
from django.contrib.auth.models import User

'''
Personal Record
'''
class Account(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='accounts') # represent "One to Many" in reverse relation
    account_name = models.CharField(max_length=255)
    balance = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return self.account_name

class Label(models.Model):
    label_name = models.CharField(max_length=255)

    def __str__(self):
        return self.label_name

class Transaction(models.Model):
    title = models.CharField(max_length=255)
    date = models.DateField()
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    attachment = models.ImageField(upload_to='transaction_images/', blank=True, null=True)
    labels =  models.ManyToManyField('Label', blank=True, null=True)

    def __str__(self):
        return f'Transaction: {self.title} - {self.total_amount} - {self.date}'

class IncomeCategory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='income_category')
    category_name = models.CharField(max_length=255)

    def __str__(self):
        return self.category_name

class Income(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='incomes') # represent "One to Many" in reverse relation
    transaction = models.ForeignKey(Transaction, on_delete=models.CASCADE)
    income_category = models.ForeignKey(IncomeCategory, on_delete=models.SET_NULL, blank=True, null=True)
    deposited_account = models.ForeignKey(Account, on_delete=models.SET_NULL, blank=True, null=True)
    
    def __str__(self):
        return f'{self.user.username} received {self.transaction.total_amount} on {self.income_category} in {self.deposited_account}'

class Transfer(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transfers') # represent "One to Many" in reverse relation
    transaction = models.ForeignKey(Transaction, on_delete=models.CASCADE)
    withdrawed_account = models.ForeignKey(Account, on_delete=models.SET_NULL, blank=True, null=True, related_name='transfer_withdrawed_accounts')
    deposited_account = models.ForeignKey(Account, on_delete=models.SET_NULL, blank=True, null=True, related_name='transfer_deposited_accounts')
    
    def __str__(self):
        return f'{self.user.username} transfer {self.transaction.total_amount} from {self.withdrawed_account} to {self.deposited_account}'

class ExpenseCategory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='expense_category')
    category_name = models.CharField(max_length=255)

    def __str__(self):
        return self.category_name

class Expense(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='expenses') # represent "One to Many" in reverse relation
    transaction = models.ForeignKey(Transaction, on_delete=models.CASCADE)
    expense_category = models.ForeignKey(ExpenseCategory, on_delete=models.SET_NULL, blank=True, null=True,)
    withdrawed_account = models.ForeignKey(Account, on_delete=models.SET_NULL, blank=True, null=True,)
    location = models.CharField(max_length=255, blank=True, null=True)
    
    def __str__(self):
        return f'{self.user.username} spent {self.transaction.total_amount} on {self.expense_category} using {self.withdrawed_account}'

'''
Group Record
'''
class Group(models.Model):
    name = models.CharField(max_length=255)

class SharedExpense(models.Model):
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='shared_expenses') # represent "One to Many" in reverse relation
    transaction = models.ForeignKey(Transaction, on_delete=models.CASCADE)
    expense_category = models.ForeignKey(ExpenseCategory, on_delete=models.SET_NULL, blank=True, null=True)
    description = models.CharField(max_length=255, blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    
    def __str__(self):
        return f'Shared: expense {self.transaction.total_amount} for ' + ','.join([user.username for user in self.splits.user])

class SplitExpense(models.Model):
    shared_expense = models.ForeignKey(SharedExpense, on_delete=models.CASCADE, related_name='splits') # represent "One to Many" in reverse relation
    user = models.ForeignKey(User, on_delete=models.SET_NULL, blank=True, null=True)
    paid_amount = models.DecimalField(max_digits=10, decimal_places=2)
    actual_expense = models.DecimalField(max_digits=10, decimal_places=2)
    
    def __str__(self):
        return f'{self.user.username} paid {self.paid_amount}, actual expense {self.actual_expense}'

class SettlementStatus(models.Model):
    status = models.CharField(max_length=255)

    def __str__(self):
        return self.status

class Settlement(models.Model):
    shared_expense = models.ForeignKey(SharedExpense, on_delete=models.CASCADE, related_name='settlements') # represent "One to Many" in reverse relation
    payer  = models.ForeignKey(User, on_delete=models.SET_NULL, blank=True, null=True, related_name='settlement_payers')
    receiver = models.ForeignKey(User, on_delete=models.SET_NULL, blank=True, null=True, related_name='settlement_receivers')
    status = models.ForeignKey(SettlementStatus, on_delete=models.SET_NULL, blank=True, null=True,)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payer_expense_ref = models.ForeignKey(Expense, on_delete=models.SET_NULL, blank=True, null=True, related_name='settlements')
    receiver_income_ref = models.ForeignKey(Income, on_delete=models.SET_NULL, blank=True, null=True, related_name='settlements')
    
    def __str__(self):
        return f'{self.payer.username} owes {self.receiver.username} {self.amount}'

class Activity(models.Model):
    subject = models.ForeignKey(User, on_delete=models.SET_NULL, blank=True, null=True, related_name='activities')
    action = models.CharField(max_length=255, blank=True, null=True)
    object = models.CharField(max_length=255, blank=True, null=True)
    environment = models.CharField(max_length=255, blank=True, null=True)

'''
Financial Record
'''
# Future work: track history of budget change
class Budget(models.Model):
    expense_category = models.ForeignKey(ExpenseCategory, on_delete=models.CASCADE)
    budget = models.DecimalField(max_digits=10, decimal_places=2)
    balance = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f'Budget for {self.expense_category} is {self.budget} and currently at {self.balance}'

class Goal(models.Model):
    title =  models.CharField(max_length=255, blank=True, null=True)
    target = models.DecimalField(max_digits=10, decimal_places=2)
    balance = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f'Goal for {self.title} is {self.target} and currenctly at {self.balance}'

RECURRING_CHOICES = (
    ('daily', 'Daily'),
    ('weekly', 'Weekly'),
    ('biweekly', 'Bi-weekly (Every 2 Weeks)'),
    ('monthly', 'Monthly'),
    ('quarterly', 'Quarterly'),
    ('annually', 'Annually'),
)

class RecurringTransaction(models.Model):
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.ForeignKey(ExpenseCategory, on_delete=models.CASCADE)
    recurrence_pattern = models.CharField(max_length=20, choices=RECURRING_CHOICES)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)

class Reminder(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    transaction = models.ForeignKey(RecurringTransaction, on_delete=models.CASCADE)
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
