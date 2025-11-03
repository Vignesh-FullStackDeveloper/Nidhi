import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, List, Button, Divider, Avatar } from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';

const ProfileScreen = () => {
  const { user, organization, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Avatar.Text
          size={80}
          label={`${user?.firstName?.[0]}${user?.lastName?.[0]}`}
          style={styles.avatar}
        />
        <Text variant="headlineSmall" style={styles.userName}>
          {user?.firstName} {user?.lastName}
        </Text>
        <Text variant="bodyMedium" style={styles.userEmail}>
          {user?.email}
        </Text>
      </View>

      <ScrollView style={styles.content}>
        <Card style={styles.card}>
          <Card.Title title="Organization" />
          <Card.Content>
            <List.Item
              title={organization?.name}
              description="Organization Name"
              left={(props) => <List.Icon {...props} icon="office-building" />}
            />
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Title title="User Information" />
          <Card.Content>
            <List.Item
              title={user?.role}
              description="Role"
              left={(props) => <List.Icon {...props} icon="shield-account" />}
            />
            <Divider />
            <List.Item
              title={user?.email}
              description="Email"
              left={(props) => <List.Icon {...props} icon="email" />}
            />
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Title title="Settings" />
          <Card.Content>
            <List.Item
              title="About"
              left={(props) => <List.Icon {...props} icon="information" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
            />
            <Divider />
            <List.Item
              title="Privacy Policy"
              left={(props) => <List.Icon {...props} icon="shield-check" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
            />
            <Divider />
            <List.Item
              title="Version"
              description="1.0.0"
              left={(props) => <List.Icon {...props} icon="information-variant" />}
            />
          </Card.Content>
        </Card>

        <Button
          mode="contained"
          onPress={handleLogout}
          style={styles.logoutButton}
          buttonColor="#f44336"
        >
          Logout
        </Button>
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
    padding: 30,
    paddingTop: 60,
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: '#fff',
    marginBottom: 15,
  },
  userName: {
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  userEmail: {
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  card: {
    marginBottom: 15,
  },
  logoutButton: {
    marginTop: 10,
    marginBottom: 30,
  },
});

export default ProfileScreen;

