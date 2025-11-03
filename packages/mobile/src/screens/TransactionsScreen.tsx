import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Text, Chip, FAB, Searchbar, Menu, Button } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { format } from 'date-fns';

const TransactionsScreen = ({ navigation }: any) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['transactions', typeFilter],
    queryFn: async () => {
      const response = await api.get('/transactions', {
        params: {
          page: 1,
          limit: 100,
          ...(typeFilter && { type: typeFilter }),
        },
      });
      return response.data;
    },
  });

  const transactions = data?.transactions || [];

  const filteredTransactions = transactions.filter((transaction: any) =>
    transaction.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.headerText}>
          Transactions
        </Text>
      </View>

      <View style={styles.filterContainer}>
        <Searchbar
          placeholder="Search transactions"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />

        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <Button mode="outlined" onPress={() => setMenuVisible(true)}>
              {typeFilter || 'All'} ▼
            </Button>
          }
        >
          <Menu.Item onPress={() => { setTypeFilter(''); setMenuVisible(false); }} title="All" />
          <Menu.Item onPress={() => { setTypeFilter('INCOME'); setMenuVisible(false); }} title="Income" />
          <Menu.Item onPress={() => { setTypeFilter('EXPENSE'); setMenuVisible(false); }} title="Expense" />
        </Menu>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
      >
        {filteredTransactions.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text style={styles.emptyText}>No transactions found</Text>
            </Card.Content>
          </Card>
        ) : (
          filteredTransactions.map((transaction: any) => (
            <Card key={transaction.id} style={styles.transactionCard}>
              <Card.Content>
                <View style={styles.transactionHeader}>
                  <View style={styles.transactionInfo}>
                    <Text variant="titleMedium">{transaction.description}</Text>
                    <Text variant="bodySmall" style={styles.transactionMeta}>
                      {transaction.payerPayee}
                    </Text>
                    <Text variant="bodySmall" style={styles.transactionDate}>
                      {format(new Date(transaction.transactionDate), 'MMM dd, yyyy')}
                    </Text>
                  </View>
                  <View style={styles.transactionRight}>
                    <Text
                      variant="headlineSmall"
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
                    <Chip
                      mode="flat"
                      style={[
                        styles.typeChip,
                        {
                          backgroundColor:
                            transaction.type === 'INCOME' ? '#e8f5e9' : '#ffebee',
                        },
                      ]}
                    >
                      {transaction.type}
                    </Chip>
                  </View>
                </View>
                <View style={styles.transactionFooter}>
                  <Chip mode="outlined" compact>
                    {transaction.paymentMethod}
                  </Chip>
                  {transaction.category && (
                    <Chip mode="outlined" compact>
                      {transaction.category.name}
                    </Chip>
                  )}
                </View>
              </Card.Content>
            </Card>
          ))
        )}
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
  headerText: {
    color: '#fff',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 15,
    gap: 10,
  },
  searchbar: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  transactionCard: {
    marginBottom: 10,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionMeta: {
    color: '#666',
    marginTop: 2,
  },
  transactionDate: {
    color: '#999',
    marginTop: 2,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontWeight: 'bold',
  },
  typeChip: {
    marginTop: 5,
  },
  transactionFooter: {
    flexDirection: 'row',
    gap: 5,
    marginTop: 10,
  },
  emptyCard: {
    marginTop: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default TransactionsScreen;

