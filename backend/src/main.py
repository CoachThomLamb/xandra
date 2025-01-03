import click
import json
from datetime import datetime
import os
import resend

resend.api_key = "re_7ZKJYziq_FCbfqachuQemKKzGT63CpnUt"

DATA_FILE = 'invoices.json'

# Initialize data file if it doesn't exist
def init_data():
    if not os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'w') as f:
            json.dump({'invoices': []}, f)

def load_data():
    with open(DATA_FILE, 'r') as f:
        return json.load(f)

def save_data(data):
    with open(DATA_FILE, 'w') as f:
        json.dump(data, f, indent=2)

@click.group()
def cli():
    """Personal Trainer Invoice Management"""
    init_data()

@cli.command()
def new():
    """Create a new invoice"""
    # Add new invoice logic here
    """Create a new invoice"""
    # Get user input
    client_name = click.prompt('Client Name')
    contact = click.prompt('Contact (email or phone)')
    amount = click.prompt('Amount (CAD)', type=float)
    notes = click.prompt('Notes (optional)', default='')

    # Create invoice object
    invoice = {
        'id': datetime.now().strftime('%Y%m%d%H%M%S'),  # timestamp as ID
        'client_name': client_name,
        'contact': contact,
        'amount': amount,
        'notes': notes,
        'date': datetime.now().strftime('%Y-%m-%d'),
        'status': 'unpaid',
        'sent': False
    }

    # Load existing data
    data = load_data()
    
    # Add new invoice
    data['invoices'].append(invoice)
    
    # Save updated data
    save_data(data)

    click.echo(f"\nInvoice created successfully!")
    click.echo(f"Invoice ID: {invoice['id']}")

    pass

@cli.command()
def list():
    """List all invoices"""
    # List invoices logic here
    data = load_data()
    if not data['invoices']:
        click.echo("No invoices found.")
    else:
        for invoice in data['invoices']:
            click.echo(f"ID: {invoice['id']}")
            click.echo(f"Client Name: {invoice['client_name']}")
            click.echo(f"Contact: {invoice['contact']}")
            click.echo(f"Amount: {invoice['amount']} CAD")
            click.echo(f"Notes: {invoice['notes']}")
            click.echo(f"Date: {invoice['date']}")
            click.echo(f"Status: {invoice['status']}")
            click.echo(f"Sent: {'Yes' if invoice['sent'] else 'No'}")
            click.echo("-" * 40)
    pass

@cli.command()
@click.argument('invoice_id')
def mark(invoice_id):
    """Mark an invoice as paid"""
    # Load data
    data = load_data()
    
    # Find invoice
    found = False
    for invoice in data['invoices']:
        if invoice['id'] == invoice_id:
            invoice['status'] = 'paid'
            found = True
            save_data(data)
            click.echo(f"Invoice {invoice_id} marked as paid!")
            break
    
    if not found:
        click.echo(f"Error: Invoice {invoice_id} not found!")

    # Mark as paid logic here
    pass
@cli.command()
@click.argument('invoice_id')
def send(invoice_id):
    """Send an invoice to client"""
    # Load data
    data = load_data()
    
    # Find invoice
    found = False
    for invoice in data['invoices']:
        if invoice['id'] == invoice_id:
            invoice['sent'] = True
            found = True
            save_data(data)
            click.echo(f"Invoice {invoice_id} sent!")
            break
    
    if not found:
        click.echo(f"Error: Invoice {invoice_id} not found!")

    # Send invoice logic here
    r = resend.Emails.send({
        "from": "onboarding@resend.dev",
        "to": "thomlamb74@gmail.com",
        "subject": "Hello World",
        "html": "Hi Sushil, <br> This is a test email from Resend."
    })
        
    pass

if __name__ == '__main__':
    cli()