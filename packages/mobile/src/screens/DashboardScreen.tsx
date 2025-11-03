import React from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Text, FAB } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { format } from 'date-fns';

const DashboardScreen = ({ navigation }: any) => {
  const { organization } = useAuth();

  const { data: reportData, isLoading, refetch } = useQuery({
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
  };

  const recentTransactions = reportData?.transactions?.slice(0, 5) || [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium">{organization?.name}</Text>
        <Text variant="bodyMedium" style={styles.headerSubtitle}>
          Dashboard
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
      >
        <View style={styles.statsContainer}>
          <Card style={[styles.statCard, { backgroundColor: '#4caf50' }]}>
            <Card.Content>
              <Text variant="bodySmall" style={styles.statLabel}>
                Total Income
              </Text>
              <Text variant="headlineSmall" style={styles.statValue}>
                ₹{summary.totalIncome.toFixed(2)}
              </Text>
            </Card.Content>
          </Card>

          <Card style={[styles.statCard, { backgroundColor: '#f44336' }]}>
            <Card.Content>
              <Text variant="bodySmall" style={styles.statLabel}>
                Total Expenses
              </Text>
              <Text variant="headlineSmall" style={styles.statValue}>
                ₹{summary.totalExpenses.toFixed(2)}
              </Text>
            </Card.Content>
          </Card>

          <Card style={[styles.statCard, { backgroundColor: '#1976d2' }]}>
            <Card.Content>
              <Text variant="bodySmall" style={styles.statLabel}>
                Balance
              </Text>
              <Text variant="headlineSmall" style={styles.statValue}>
                ₹{summary.balance.toFixed(2)}
              </Text>
            </Card.Content>
          </Card>
        </View>

        <Card style={styles.transactionsCard}>
          <Card.Title title="Recent Transactions" />
          <Card.Content>
            {recentTransactions.length === 0 ? (
              <Text>No transactions yet</Text>
            ) : (
              recentTransactions.map((transaction: any) => (
                <View key={transaction.id} style={styles.transactionItem}>
                  <View style={styles.transactionInfo}>
                    <Text variant="bodyMedium">{transaction.description}</Text>
                    <Text variant="bodySmall" style={styles.transactionDate}>
                      {format(new Date(transaction.transactionDate), 'MMM dd, yyyy')}
                    </Text>
                  </View>
                  <Text
                    variant="bodyLarge"
                    style={[
                      styles.transactionAmount,
                      {
                        color: transaction.type === 'INCOME' ? '#4caf50' : '#f44336',
                      },
                    ]}
                  >
                    {transaction.type === 'INCOME' ? '+' : '-'}₹
                    {transaction.amount.toFixed(2)}
                  </Text>
                </View>
              ))
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('AddTransaction')}
      />
    </View>
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
  headerSubtitle: {
    color: '#fff',
    marginTop: 5,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  statsContainer: {
    marginBottom: 15,
  },
  statCard: {
    marginBottom: 10,
  },
  statLabel: {
    color: '#fff',
    marginBottom: 5,
  },
  statValue: {
    color: '#fff',
    fontWeight: 'bold',
  },
  transactionsCard: {
    marginBottom: 20,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDate: {
    color: '#666',
    marginTop: 2,
  },
  transactionAmount: {
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default DashboardScreen;

