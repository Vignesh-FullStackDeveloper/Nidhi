import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  Add,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { format } from 'date-fns';

const DashboardPage = () => {
  const navigate = useNavigate();

  const { data: reportData, isLoading } = useQuery({
    queryKey: ['report', 'month'],
    queryFn: async () => {
      const response = await api.get('/reports/summary', {
        params: { period: 'month' },
      });
      return response.data;
    },
  });

  const summary = reportData?.summary || {
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    incomeCount: 0,
    expenseCount: 0,
  };

  const recentTransactions = reportData?.transactions?.slice(0, 5) || [];

  const StatCard = ({ title, value, icon, color }: any) => (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4">{value}</Typography>
          </Box>
          <Box
            sx={{
              backgroundColor: `${color}.main`,
              color: 'white',
              borderRadius: 2,
              p: 1,
              display: 'flex',
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Dashboard
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/transactions/add')}
        >
          Add Transaction
        </Button>
      </Box>

      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Income"
            value={`₹${summary.totalIncome.toFixed(2)}`}
            icon={<TrendingUp />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Expenses"
            value={`₹${summary.totalExpenses.toFixed(2)}`}
            icon={<TrendingDown />}
            color="error"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Balance"
            value={`₹${summary.balance.toFixed(2)}`}
            icon={<AccountBalance />}
            color={summary.balance >= 0 ? 'primary' : 'error'}
          />
        </Grid>
      </Grid>

      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Recent Transactions</Typography>
          <Button size="small" onClick={() => navigate('/transactions')}>
            View All
          </Button>
        </Box>

        {isLoading ? (
          <Typography>Loading...</Typography>
        ) : recentTransactions.length === 0 ? (
          <Typography color="text.secondary">No transactions yet</Typography>
        ) : (
          <Box>
            {recentTransactions.map((transaction: any) => (
              <Box
                key={transaction.id}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                py={2}
                borderBottom="1px solid #e0e0e0"
              >
                <Box>
                  <Typography variant="body1">{transaction.description}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {format(new Date(transaction.transactionDate), 'MMM dd, yyyy')}
                  </Typography>
                </Box>
                <Typography
                  variant="h6"
                  color={transaction.type === 'INCOME' ? 'success.main' : 'error.main'}
                >
                  {transaction.type === 'INCOME' ? '+' : '-'}₹
                  {transaction.amount.toFixed(2)}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default DashboardPage;

