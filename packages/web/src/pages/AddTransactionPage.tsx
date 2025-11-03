import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { Save, Cancel } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import api from '../services/api';

const currencies = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CNY', 'AUD', 'CAD', 'OTHER'];
const paymentMethods = ['CASH', 'CHEQUE', 'DD', 'BANK_TRANSFER', 'CARD', 'UPI', 'OTHER'];

const AddTransactionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const [formData, setFormData] = useState({
    type: 'INCOME',
    amount: '',
    currency: 'INR',
    description: '',
    purpose: '',
    paymentMethod: 'CASH',
    payerPayee: '',
    recipientGiver: '',
    location: '',
    transactionDate: new Date().toISOString().split('T')[0],
    categoryId: '',
  });

  const [files, setFiles] = useState<FileList | null>(null);

  const { data: categories } = useQuery({
    queryKey: ['categories', formData.type],
    queryFn: async () => {
      const response = await api.get('/categories', {
        params: { type: formData.type },
      });
      return response.data;
    },
  });

  const { data: transaction } = useQuery({
    queryKey: ['transaction', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await api.get(`/transactions/${id}`);
      return response.data;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (transaction) {
      setFormData({
        type: transaction.type,
        amount: transaction.amount.toString(),
        currency: transaction.currency,
        description: transaction.description,
        purpose: transaction.purpose || '',
        paymentMethod: transaction.paymentMethod,
        payerPayee: transaction.payerPayee,
        recipientGiver: transaction.recipientGiver || '',
        location: transaction.location || '',
        transactionDate: transaction.transactionDate.split('T')[0],
        categoryId: transaction.categoryId || '',
      });
    }
  }, [transaction]);

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (id) {
        return api.put(`/transactions/${id}`, data);
      }
      return api.post('/transactions', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      enqueueSnackbar(
        `Transaction ${id ? 'updated' : 'created'} successfully`,
        { variant: 'success' }
      );
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      navigate('/transactions');
    },
    onError: () => {
      enqueueSnackbar(
        `Failed to ${id ? 'update' : 'create'} transaction`,
        { variant: 'error' }
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const submitData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value) submitData.append(key, value);
    });

    if (files) {
      Array.from(files).forEach((file) => {
        submitData.append('attachments', file);
      });
    }

    createMutation.mutate(submitData);
  };

  const handleChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" mb={3}>
        {id ? 'Edit Transaction' : 'Add Transaction'}
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Type</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  label="Type"
                >
                  <MenuItem value="INCOME">Income</MenuItem>
                  <MenuItem value="EXPENSE">Expense</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                type="number"
                name="amount"
                label="Amount"
                value={formData.amount}
                onChange={handleChange}
                inputProps={{ step: '0.01', min: '0' }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Currency</InputLabel>
                <Select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  label="Currency"
                >
                  {currencies.map((currency) => (
                    <MenuItem key={currency} value={currency}>
                      {currency}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  label="Payment Method"
                >
                  {paymentMethods.map((method) => (
                    <MenuItem key={method} value={method}>
                      {method.replace('_', ' ')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="description"
                label="Description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={2}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                name="purpose"
                label="Purpose"
                value={formData.purpose}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                name="payerPayee"
                label={formData.type === 'INCOME' ? 'Payer (Who gave)' : 'Payee (To whom)'}
                value={formData.payerPayee}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="recipientGiver"
                label={
                  formData.type === 'INCOME' ? 'Recipient (To whom)' : 'Giver (Who gave)'
                }
                value={formData.recipientGiver}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="location"
                label="Location"
                value={formData.location}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                type="date"
                name="transactionDate"
                label="Transaction Date"
                value={formData.transactionDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  label="Category"
                >
                  <MenuItem value="">None</MenuItem>
                  {categories?.map((category: any) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {!id && (
              <Grid item xs={12}>
                <Button variant="outlined" component="label" fullWidth>
                  Upload Attachments (Images, PDFs)
                  <input
                    type="file"
                    hidden
                    multiple
                    accept="image/*,application/pdf"
                    onChange={(e) => setFiles(e.target.files)}
                  />
                </Button>
                {files && (
                  <Typography variant="caption" display="block" mt={1}>
                    {files.length} file(s) selected
                  </Typography>
                )}
              </Grid>
            )}

            <Grid item xs={12}>
              <Box display="flex" gap={2}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<Save />}
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? 'Saving...' : 'Save'}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Cancel />}
                  onClick={() => navigate('/transactions')}
                >
                  Cancel
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default AddTransactionPage;

