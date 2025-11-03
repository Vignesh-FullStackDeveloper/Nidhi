import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
} from '@mui/material';
import { Save } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const OrganizationPage = () => {
  const { organization } = useAuth();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
  });

  const { data: orgData } = useQuery({
    queryKey: ['organization', organization?.id],
    queryFn: async () => {
      const response = await api.get(`/organizations/${organization?.id}`);
      return response.data;
    },
    enabled: !!organization?.id,
  });

  useEffect(() => {
    if (orgData) {
      setFormData({
        name: orgData.name || '',
        description: orgData.description || '',
        address: orgData.address || '',
        phone: orgData.phone || '',
        email: orgData.email || '',
      });
    }
  }, [orgData]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.put(`/organizations/${organization?.id}`, data),
    onSuccess: () => {
      enqueueSnackbar('Organization updated successfully', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['organization'] });
    },
    onError: () => {
      enqueueSnackbar('Failed to update organization', { variant: 'error' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" mb={3}>
        Organization Settings
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="name"
                label="Organization Name"
                value={formData.name}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                name="description"
                label="Description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={3}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                name="address"
                label="Address"
                value={formData.address}
                onChange={handleChange}
                multiline
                rows={2}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="phone"
                label="Phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="email"
                name="email"
                label="Email"
                value={formData.email}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                startIcon={<Save />}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </Grid>
          </Grid>
        </Box>

        {orgData && (
          <Box mt={4}>
            <Typography variant="h6" gutterBottom>
              Statistics
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Paper sx={{ p: 2, bgcolor: 'primary.light', color: 'white' }}>
                  <Typography variant="h4">{orgData._count?.transactions || 0}</Typography>
                  <Typography>Total Transactions</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Paper sx={{ p: 2, bgcolor: 'secondary.light', color: 'white' }}>
                  <Typography variant="h4">{orgData.users?.length || 0}</Typography>
                  <Typography>Total Users</Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default OrganizationPage;

