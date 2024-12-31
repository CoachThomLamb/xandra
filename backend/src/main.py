import click
import json
from datetime import datetime
import os

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
    # Mark as paid logic here
    pass

if __name__ == '__main__':
    cli()