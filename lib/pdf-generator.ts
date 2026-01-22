import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  date: string;
}

interface StatementOptions {
  transactions: Transaction[];
  startDate?: string;
  endDate?: string;
  userName?: string;
  userEmail?: string;
}

export async function generateTransactionStatement(options: StatementOptions): Promise<string | null> {
  const { transactions, startDate, endDate, userName = 'Student Account', userEmail = 'scholar@student.ac.za' } = options;

  // Calculate totals
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpenses;

  // Format date range
  const dateRange = startDate && endDate
    ? `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`
    : 'All Transactions';

  // Generate HTML for PDF
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Transaction Statement</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            padding: 40px;
            color: #333;
            line-height: 1.6;
          }
          
          .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 3px solid #0a7ea4;
          }
          
          .header h1 {
            color: #0a7ea4;
            font-size: 32px;
            margin-bottom: 10px;
          }
          
          .header p {
            color: #666;
            font-size: 14px;
          }
          
          .account-info {
            background: #f5f5f5;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
          }
          
          .account-info h2 {
            font-size: 18px;
            margin-bottom: 10px;
            color: #333;
          }
          
          .account-info p {
            font-size: 14px;
            color: #666;
            margin-bottom: 5px;
          }
          
          .summary {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-bottom: 30px;
          }
          
          .summary-card {
            background: #fff;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
          }
          
          .summary-card.income {
            border-color: #22c55e;
          }
          
          .summary-card.expense {
            border-color: #ef4444;
          }
          
          .summary-card.net {
            border-color: #0a7ea4;
          }
          
          .summary-card h3 {
            font-size: 14px;
            color: #666;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .summary-card .amount {
            font-size: 24px;
            font-weight: bold;
          }
          
          .summary-card.income .amount {
            color: #22c55e;
          }
          
          .summary-card.expense .amount {
            color: #ef4444;
          }
          
          .summary-card.net .amount {
            color: #0a7ea4;
          }
          
          .transactions {
            margin-top: 30px;
          }
          
          .transactions h2 {
            font-size: 20px;
            margin-bottom: 20px;
            color: #333;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            background: #fff;
          }
          
          thead {
            background: #0a7ea4;
            color: white;
          }
          
          th {
            padding: 12px;
            text-align: left;
            font-weight: 600;
            font-size: 14px;
          }
          
          td {
            padding: 12px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 14px;
          }
          
          tr:hover {
            background: #f9fafb;
          }
          
          .amount-income {
            color: #22c55e;
            font-weight: 600;
          }
          
          .amount-expense {
            color: #ef4444;
            font-weight: 600;
          }
          
          .category-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 500;
            background: #e5e7eb;
            color: #333;
          }
          
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            color: #666;
            font-size: 12px;
          }
          
          @media print {
            body {
              padding: 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Scholar Fin Hub</h1>
          <p>Transaction Statement</p>
        </div>
        
        <div class="account-info">
          <h2>Account Information</h2>
          <p><strong>Name:</strong> ${userName}</p>
          <p><strong>Email:</strong> ${userEmail}</p>
          <p><strong>Period:</strong> ${dateRange}</p>
          <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="summary">
          <div class="summary-card income">
            <h3>Total Income</h3>
            <div class="amount">R${totalIncome.toFixed(2)}</div>
          </div>
          
          <div class="summary-card expense">
            <h3>Total Expenses</h3>
            <div class="amount">R${totalExpenses.toFixed(2)}</div>
          </div>
          
          <div class="summary-card net">
            <h3>Net Balance</h3>
            <div class="amount">R${netBalance.toFixed(2)}</div>
          </div>
        </div>
        
        <div class="transactions">
          <h2>Transaction History (${transactions.length} transactions)</h2>
          
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${transactions.map(transaction => `
                <tr>
                  <td>${new Date(transaction.date).toLocaleDateString()}</td>
                  <td>${transaction.description}</td>
                  <td><span class="category-badge">${transaction.category}</span></td>
                  <td class="amount-${transaction.type}">
                    ${transaction.type === 'income' ? '+' : '-'}R${transaction.amount.toFixed(2)}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <div class="footer">
          <p>This statement was generated automatically by Scholar Fin Hub</p>
          <p>For any queries, please contact support@scholarfinhub.co.za</p>
        </div>
      </body>
    </html>
  `;

  try {
    // Generate PDF
    const { uri } = await Print.printToFileAsync({ html });
    return uri;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return null;
  }
}

export async function shareTransactionStatement(pdfUri: string): Promise<boolean> {
  try {
    const isAvailable = await Sharing.isAvailableAsync();
    
    if (!isAvailable) {
      console.error('Sharing is not available on this device');
      return false;
    }

    await Sharing.shareAsync(pdfUri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Share Transaction Statement',
      UTI: 'com.adobe.pdf',
    });

    return true;
  } catch (error) {
    console.error('Error sharing PDF:', error);
    return false;
  }
}
