const summaryCards = [
  { label: 'Total Books', value: '1,248', delta: '+4.3% vs last month' },
  { label: 'Active Customers', value: '836', delta: '+2.1% vs last month' },
  { label: 'Monthly Revenue', value: '$32,940', delta: '+6.8% vs last month' },
];

const recentSales = [
  { id: 'INV-1042', customer: 'Alex Johnson', total: '$124.50', date: '2024-03-04' },
  { id: 'INV-1041', customer: 'Priya Patel', total: '$89.90', date: '2024-03-03' },
  { id: 'INV-1040', customer: 'Marcus Chen', total: '$212.00', date: '2024-03-01' },
];

export default function DashboardPage() {
  return (
    <section className="dashboard-overview">
      <header className="dashboard-header">
        <div>
          <h2>Overview</h2>
          <p>Track store performance and recent activity at a glance.</p>
        </div>
        <button type="button" className="dashboard-primary-btn">Add Sale</button>
      </header>

      <div className="dashboard-cards">
        {summaryCards.map((card) => (
          <article key={card.label} className="dashboard-card">
            <h3>{card.label}</h3>
            <p className="dashboard-card-value">{card.value}</p>
            <p className="dashboard-card-delta">{card.delta}</p>
          </article>
        ))}
      </div>

      <section className="dashboard-panel">
        <header>
          <h3>Recent Sales</h3>
          <p>Latest transactions recorded in the system.</p>
        </header>
        <table>
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {recentSales.map((sale) => (
              <tr key={sale.id}>
                <td>{sale.id}</td>
                <td>{sale.customer}</td>
                <td>{sale.total}</td>
                <td>{sale.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </section>
  );
}
