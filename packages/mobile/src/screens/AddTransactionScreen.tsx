import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, SegmentedButtons, Snackbar } from 'react-native-paper';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

const currencies = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CNY', 'AUD', 'CAD'];
const paymentMethods = ['CASH', 'CHEQUE', 'DD', 'BANK_TRANSFER', 'CARD', 'UPI', 'OTHER'];

const AddTransactionScreen = ({ navigation }: any) => {
  const queryClient = useQueryClient();
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
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return api.post('/transactions', data);
    },
    onSuccess: () => {
      setSuccess('Transaction created successfully');
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['report'] });
      setTimeout(() => navigation.goBack(), 1500);
    },
    onError: () => {
      setError('Failed to create transaction');
    },
  });

  const handleSubmit = () => {
    if (!formData.amount || !formData.description || !formData.payerPayee) {
      setError('Please fill all required fields');
      return;
    }

    const submitData = {
      ...formData,
      amount: parseFloat(formData.amount),
      transactionDate: new Date(formData.transactionDate).toISOString(),
    };

    createMutation.mutate(submitData);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.headerText}>
          Add Transaction
        </Text>
      </View>

      <ScrollView style={styles.content}>
        <SegmentedButtons
          value={formData.type}
          onValueChange={(value) => setFormData({ ...formData, type: value })}
          buttons={[
            { value: 'INCOME', label: 'Income' },
            { value: 'EXPENSE', label: 'Expense' },
          ]}
          style={styles.segmented}
        />

        <TextInput
          label="Amount *"
          value={formData.amount}
          onChangeText={(value) => setFormData({ ...formData, amount: value })}
          keyboardType="decimal-pad"
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Description *"
          value={formData.description}
          onChangeText={(value) => setFormData({ ...formData, description: value })}
          mode="outlined"
          multiline
          style={styles.input}
        />

        <TextInput
          label={formData.type === 'INCOME' ? 'Payer (Who gave) *' : 'Payee (To whom) *'}
          value={formData.payerPayee}
          onChangeText={(value) => setFormData({ ...formData, payerPayee: value })}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Purpose"
          value={formData.purpose}
          onChangeText={(value) => setFormData({ ...formData, purpose: value })}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Location"
          value={formData.location}
          onChangeText={(value) => setFormData({ ...formData, location: value })}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Date"
          value={formData.transactionDate}
          onChangeText={(value) => setFormData({ ...formData, transactionDate: value })}
          mode="outlined"
          style={styles.input}
        />

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={createMutation.isPending}
            disabled={createMutation.isPending}
            style={styles.button}
          >
            Save Transaction
          </Button>

          <Button mode="outlined" onPress={() => navigation.goBack()} style={styles.button}>
            Cancel
          </Button>
        </View>
      </ScrollView>

      <Snackbar
        visible={!!error}
        onDismiss={() => setError('')}
        duration={3000}
        action={{ label: 'OK', onPress: () => setError('') }}
      >
        {error}
      </Snackbar>

      <Snackbar
        visible={!!success}
        onDismiss={() => setSuccess('')}
        duration={1500}
      >
        {success}
      </Snackbar>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#1976d2',
    padding: 20,
    paddingTop: 50,
  },
  headerText: {
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  segmented: {
    marginBottom: 15,
  },
  input: {
    marginBottom: 15,
  },
  buttonContainer: {
    marginTop: 10,
    marginBottom: 30,
  },
  button: {
    marginBottom: 10,
  },
});

export default AddTransactionScreen;

