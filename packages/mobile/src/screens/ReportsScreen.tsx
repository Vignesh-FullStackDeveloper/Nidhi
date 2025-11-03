import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Text, SegmentedButtons } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { format } from 'date-fns';

const ReportsScreen = () => {
  const [period, setPeriod] = useState('month');

  const { data: reportData, isLoading, refetch } = useQuery({
    queryKey: ['report', period],
    queryFn: async () => {
      const response = await api.get('/reports/summary', {
        params: { period },
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.headerText}>
          Reports
        </Text>
      </View>

      <View style={styles.periodSelector}>
        <SegmentedButtons
          value={period}
          onValueChange={setPeriod}
          buttons={[
            { value: 'week', label: 'Week' },
            { value: 'month', label: 'Month' },
            { value: 'year', label: 'Year' },
          ]}
        />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={isLoading} onRefetch={refetch} />}
      >
        {reportData && (
          <Card style={styles.periodCard}>
            <Card.Content>
              <Text variant="bodyMedium">
                {format(new Date(reportData.period.startDate), 'MMM dd')} -{' '}
                {format(new Date(reportData.period.endDate), 'MMM dd, yyyy')}
              </Text>
            </Card.Content>
          </Card>
        )}

        <View style={styles.summaryContainer}>
          <Card style={[styles.summaryCard, { backgroundColor: '#4caf50' }]}>
            <Card.Content>
              <Text variant="bodySmall" style={styles.summaryLabel}>
                Total Income
              </Text>
              <Text variant="headlineMedium" style={styles.summaryValue}>
                ₹{summary.totalIncome.toFixed(2)}
              </Text>
              <Text variant="bodySmall" style={styles.summaryCount}>
                {summary.incomeCount} transactions
              </Text>
            </Card.Content>
          </Card>

          <Card style={[styles.summaryCard, { backgroundColor: '#f44336' }]}>
            <Card.Content>
              <Text variant="bodySmall" style={styles.summaryLabel}>
                Total Expenses
              </Text>
              <Text variant="headlineMedium" style={styles.summaryValue}>
                ₹{summary.totalExpenses.toFixed(2)}
              </Text>
              <Text variant="bodySmall" style={styles.summaryCount}>
                {summary.expenseCount} transactions
              </Text>
            </Card.Content>
          </Card>

          <Card style={[styles.summaryCard, { backgroundColor: '#1976d2' }]}>
            <Card.Content>
              <Text variant="bodySmall" style={styles.summaryLabel}>
                Balance
              </Text>
              <Text variant="headlineMedium" style={styles.summaryValue}>
                ₹{summary.balance.toFixed(2)}
              </Text>
            </Card.Content>
          </Card>
        </View>

        {categoryBreakdown.INCOME && Object.keys(categoryBreakdown.INCOME).length > 0 && (
          <Card style={styles.categoryCard}>
            <Card.Title title="Income by Category" />
            <Card.Content>
              {Object.entries(categoryBreakdown.INCOME).map(([category, data]: [string, any]) => (
                <View key={category} style={styles.categoryItem}>
                  <View>
                    <Text variant="bodyMedium">{category}</Text>
                    <Text variant="bodySmall" style={styles.categoryCount}>
                      {data.count} transactions
                    </Text>
                  </View>
                  <Text variant="titleMedium" style={styles.incomeAmount}>
                    ₹{data.total.toFixed(2)}
                  </Text>
                </View>
              ))}
            </Card.Content>
          </Card>
        )}

        {categoryBreakdown.EXPENSE && Object.keys(categoryBreakdown.EXPENSE).length > 0 && (
          <Card style={styles.categoryCard}>
            <Card.Title title="Expenses by Category" />
            <Card.Content>
              {Object.entries(categoryBreakdown.EXPENSE).map(([category, data]: [string, any]) => (
                <View key={category} style={styles.categoryItem}>
                  <View>
                    <Text variant="bodyMedium">{category}</Text>
                    <Text variant="bodySmall" style={styles.categoryCount}>
                      {data.count} transactions
                    </Text>
                  </View>
                  <Text variant="titleMedium" style={styles.expenseAmount}>
                    ₹{data.total.toFixed(2)}
                  </Text>
                </View>
              ))}
            </Card.Content>
          </Card>
        )}
      </ScrollView>
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
  headerText: {
    color: '#fff',
  },
  periodSelector: {
    padding: 15,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  periodCard: {
    marginBottom: 15,
  },
  summaryContainer: {
    marginBottom: 15,
  },
  summaryCard: {
    marginBottom: 10,
  },
  summaryLabel: {
    color: '#fff',
    marginBottom: 5,
  },
  summaryValue: {
    color: '#fff',
    fontWeight: 'bold',
  },
  summaryCount: {
    color: '#fff',
    marginTop: 5,
  },
  categoryCard: {
    marginBottom: 15,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  categoryCount: {
    color: '#666',
    marginTop: 2,
  },
  incomeAmount: {
    color: '#4caf50',
    fontWeight: 'bold',
  },
  expenseAmount: {
    color: '#f44336',
    fontWeight: 'bold',
  },
});

export default ReportsScreen;

