Hello, my name is Rushil Gupta and this is my web development project which provides household services.

In order to smoothly run my application, download the HouseFix folder and open it in wsl-ubuntu (if using windows) using a code editor such as VS code. 
Create a virtual environment using command 'python -m venv .venv' in the terminal.
Once the environment is created, activate it using the command 'source .venv/bin/activate'
Download all dependencies listed in req.txt using the command 'pip install -r req.txt' in the terminal.
run the command 'python3 app.py' in the terminal. Create another terminal and run the command 'redis-server' in it.
The application should now run as intended. 
In order to run backend tasks, use the following celery commands: 'celery -A app:celery_app worker -l INFO' 
and 'celery -A app:celery_app beat -l INFO' in new and separate terminals.
To test the email sending functionality, you can run mailhog using this command '~/go/bin/MailHog' in a separate terminal.

That's it, thank you for viewing my application. Any suggestions or feedbacks are welcome!
