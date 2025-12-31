import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface CollapsibleProps {
  title: string;
  children: React.ReactNode;
}

export function Collapsible({ title, children }: CollapsibleProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)} style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.arrow}>{isExpanded ? '▼' : '▶'}</Text>
      </TouchableOpacity>
      {isExpanded && <View style={styles.content}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginVertical: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  arrow: {
    fontSize: 16,
  },
  content: {
    padding: 10,
  },
});
