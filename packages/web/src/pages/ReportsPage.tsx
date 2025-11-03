import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Download, Email } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import api from '../services/api';
import { format } from 'date-fns';

const ReportsPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [period, setPeriod] = useState('month');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [emailDialog, setEmailDialog] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');

  const { data: reportData, isLoading } = useQuery({
    queryKey: ['report', period, date],
    queryFn: async () => {
      const response = await api.get('/reports/summary', {
        params: { period, date },
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

  const categoryBreakdown = reportData?.categoryBreakdown || {};

  const handleDownload = async () => {
    try {
      const response = await api.get('/reports/download', {
        params: { period, date },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report-${period}-${date}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      enqueueSnackbar('Report downloaded successfully', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Failed to download report', { variant: 'error' });
    }
  };

  const handleEmailSend = async () => {
    try {
      const response = await api.post('/reports/email', {
        email: emailAddress,
        period,
        date,
      }, {
        responseType: 'blob', // Can be PDF or JSON, we'll check the content-type
        validateStatus: (status) => status < 500, // Accept 200, 400, 404, etc.
      });

      const contentType = response.headers['content-type'] || '';
      
      // If response is PDF (email not configured)
      if (contentType.includes('application/pdf')) {
        const url = window.URL.createObjectURL(response.data);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `report-${period}-${date}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        
        enqueueSnackbar('Email not configured. PDF downloaded instead. See README.md for email setup instructions.', { 
          variant: 'info',
          autoHideDuration: 6000
        });
        setEmailDialog(false);
        setEmailAddress('');
        return;
      }

      // If response is JSON (email was sent successfully)
      if (contentType.includes('application/json')) {
        const text = await (response.data as Blob).text();
        const jsonData = JSON.parse(text);
        
        if (jsonData.message) {
          enqueueSnackbar('Report sent to email successfully', { variant: 'success' });
          setEmailDialog(false);
          setEmailAddress('');
        } else if (jsonData.error) {
          throw new Error(jsonData.error);
        }
      }
    } catch (error: any) {
      // If error, show message and offer to download PDF instead
      const errorMessage = error.response?.data ? 
        (error.response.data instanceof Blob ? 
          'Email service not configured' : 
          error.response.data.error || error.response.data.message) :
        error.message || 'Failed to send report';
      
      enqueueSnackbar(errorMessage + '. You can download the PDF instead.', { 
        variant: 'warning',
        autoHideDuration: 6000
      });
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" mb={3}>
        Reports
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Period</InputLabel>
              <Select value={period} onChange={(e) => setPeriod(e.target.value)} label="Period">
                <MenuItem value="week">Week</MenuItem>
                <MenuItem value="month">Month</MenuItem>
                <MenuItem value="year">Year</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              type="date"
              label="Date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box display="flex" gap={1}>
              <Button
                variant="contained"
                startIcon={<Download />}
                onClick={handleDownload}
                fullWidth
              >
                Download PDF
              </Button>
              <Button
                variant="outlined"
                startIcon={<Email />}
                onClick={() => setEmailDialog(true)}
                fullWidth
              >
                Email
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {isLoading ? (
        <Typography>Loading...</Typography>
      ) : (
        <>
          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Total Income
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    ₹{summary.totalIncome.toFixed(2)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {summary.incomeCount} transactions
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Total Expenses
                  </Typography>
                  <Typography variant="h4" color="error.main">
                    ₹{summary.totalExpenses.toFixed(2)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {summary.expenseCount} transactions
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Balance
                  </Typography>
                  <Typography
                    variant="h4"
                    color={summary.balance >= 0 ? 'primary.main' : 'error.main'}
                  >
                    ₹{summary.balance.toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Period
                  </Typography>
                  <Typography variant="h6">
                    {reportData?.period?.startDate &&
                      format(new Date(reportData.period.startDate), 'MMM dd')}
                    {' - '}
                    {reportData?.period?.endDate &&
                      format(new Date(reportData.period.endDate), 'MMM dd, yyyy')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            {categoryBreakdown.INCOME && (
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Income by Category
                  </Typography>
                  {Object.entries(categoryBreakdown.INCOME).map(([category, data]: [string, any]) => (
                    <Box
                      key={category}
                      display="flex"
                      justifyContent="space-between"
                      py={1}
                      borderBottom="1px solid #e0e0e0"
                    >
                      <Box>
                        <Typography>{category}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {data.count} transactions
                        </Typography>
                      </Box>
                      <Typography color="success.main" fontWeight="bold">
                        ₹{data.total.toFixed(2)}
                      </Typography>
                    </Box>
                  ))}
                </Paper>
              </Grid>
            )}

            {categoryBreakdown.EXPENSE && (
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Expenses by Category
                  </Typography>
                  {Object.entries(categoryBreakdown.EXPENSE).map(([category, data]: [string, any]) => (
                    <Box
                      key={category}
                      display="flex"
                      justifyContent="space-between"
                      py={1}
                      borderBottom="1px solid #e0e0e0"
                    >
                      <Box>
                        <Typography>{category}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {data.count} transactions
                        </Typography>
                      </Box>
                      <Typography color="error.main" fontWeight="bold">
                        ₹{data.total.toFixed(2)}
                      </Typography>
                    </Box>
                  ))}
                </Paper>
              </Grid>
            )}
          </Grid>
        </>
      )}

      <Dialog open={emailDialog} onClose={() => setEmailDialog(false)}>
        <DialogTitle>Email Report</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            type="email"
            label="Email Address"
            value={emailAddress}
            onChange={(e) => setEmailAddress(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEmailDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleEmailSend}>
            Send
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReportsPage;

