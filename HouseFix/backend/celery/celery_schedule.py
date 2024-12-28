from celery.schedules import crontab
from flask import current_app as app
from backend.celery.tasks import email_reminder
from backend.models import User, Professional

celery_app = app.extensions['celery']

@celery_app.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    # Query all professionals' emails
    professionals = Professional.query.all()
    professional_emails = [prof.user.email for prof in professionals]

    # Schedule email reminders for each professional
    for email in professional_emails:
        # every 10 seconds
        sender.add_periodic_task(10.0, email_reminder.s(email, 'reminder to login', '<h1> Hello Professional! Please login to check for new service requests. </h1>'))

        # daily message at 6:55 pm, everyday
        sender.add_periodic_task(crontab(hour=18, minute=55), email_reminder.s(email, 'reminder to login', '<h1>  Hello Professional! Please login to check for new service requests. </h1>'), name=f'daily reminder {email}')

        # weekly messages
        sender.add_periodic_task(crontab(hour=18, minute=55, day_of_week='monday'), email_reminder.s(email, 'reminder to login', '<h1>  Hello Professional! Please login to check for new service requests. </h1>'), name=f'weekly reminder {email}')
