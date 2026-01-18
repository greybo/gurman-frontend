// src/hooks/useSalesData.js
import { useState, useEffect, useMemo, useRef } from 'react';
import { database } from '../firebase';
import { ref, onValue } from 'firebase/database';
import { orderSallesDbPath } from '../PathDb';

export default function useSalesData() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [selectedClient, setSelectedClient] = useState('');
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  const clientDropdownRef = useRef(null);

  // Fetch orders from Firebase
  useEffect(() => {
    setLoading(true);
    setError('');

    const ordersRef = ref(database, orderSallesDbPath);

    const unsubscribe = onValue(ordersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        // Convert object to array and add key as orderId
        const ordersArray = Object.entries(data).map(([key, value]) => ({
          ...value,
          orderId: key
        }));
        console.log('Orders loaded:', ordersArray.length);
        setOrders(ordersArray);
        setError('');
      } else {
        console.warn('No orders found at path:', orderSallesDbPath);
        setOrders([]);
        setError('Замовлень не знайдено');
      }
      setLoading(false);
    }, (err) => {
      console.error('Error loading orders:', err);
      setError('Помилка завантаження даних');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (clientDropdownRef.current && !clientDropdownRef.current.contains(event.target)) {
        setShowClientDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get unique clients for filter dropdown
  const uniqueClients = useMemo(() => {
    const clientsMap = new Map();

    orders.forEach(order => {
      const fName = order.fName || order.primaryContact?.fName || '';
      const lName = order.lName || order.primaryContact?.lName || '';
      const fullName = `${fName} ${lName}`.trim();

      if (fullName) {
        clientsMap.set(fullName, fullName);
      }
    });

    return Array.from(clientsMap.values()).sort();
  }, [orders]);

  // Filter clients by search term
  const filteredClients = useMemo(() => {
    if (!clientSearchTerm) return uniqueClients;
    const searchLower = clientSearchTerm.toLowerCase();
    return uniqueClients.filter(client =>
      client.toLowerCase().includes(searchLower)
    );
  }, [uniqueClients, clientSearchTerm]);

  // Handle client selection from dropdown
  const handleSelectClient = (client) => {
    setSelectedClient(client);
    setClientSearchTerm(client);
    setShowClientDropdown(false);
  };

  // Handle client input change
  const handleClientInputChange = (value) => {
    setClientSearchTerm(value);
    setShowClientDropdown(true);
    // If input is cleared, clear the filter
    if (!value) {
      setSelectedClient('');
    }
  };

  // Clear selected month if it doesn't belong to the selected year
  useEffect(() => {
    if (selectedMonth && selectedYear) {
      if (!selectedMonth.startsWith(selectedYear)) {
        setSelectedMonth('');
      }
    }
  }, [selectedYear, selectedMonth]);

  // Get unique months for filter dropdown (filtered by selected year)
  const uniqueMonths = useMemo(() => {
    const monthsSet = new Set();

    orders.forEach(order => {
      const date = order.updateDate || order.createNewOrder;
      if (date) {
        const month = date.substring(0, 7); // "YYYY-MM"
        // If a year is selected, only include months from that year
        if (selectedYear) {
          if (month.startsWith(selectedYear)) {
            monthsSet.add(month);
          }
        } else {
          monthsSet.add(month);
        }
      }
    });

    return Array.from(monthsSet).sort().reverse();
  }, [orders, selectedYear]);

  // Get unique years for filter dropdown
  const uniqueYears = useMemo(() => {
    const yearsSet = new Set();

    orders.forEach(order => {
      const date = order.updateDate || order.createNewOrder;
      if (date) {
        const year = date.substring(0, 4);
        yearsSet.add(year);
      }
    });

    return Array.from(yearsSet).sort().reverse();
  }, [orders]);

  // Filter orders based on selected filters
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Filter by client
      if (selectedClient) {
        const fName = order.fName || order.primaryContact?.fName || '';
        const lName = order.lName || order.primaryContact?.lName || '';
        const fullName = `${fName} ${lName}`.trim();
        if (fullName !== selectedClient) {
          return false;
        }
      }

      // Filter by month
      if (selectedMonth) {
        const date = order.updateDate || order.createNewOrder;
        if (!date || !date.startsWith(selectedMonth)) {
          return false;
        }
      }

      // Filter by year
      if (selectedYear) {
        const date = order.updateDate || order.createNewOrder;
        if (!date || !date.startsWith(selectedYear)) {
          return false;
        }
      }

      return true;
    });
  }, [orders, selectedClient, selectedMonth, selectedYear]);

  // Calculate total sum of filtered orders
  const totalSum = useMemo(() => {
    return filteredOrders.reduce((sum, order) => {
      return sum + (order.paymentAmount || 0);
    }, 0);
  }, [filteredOrders]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    // Format: "YYYY-MM-DD HH:MM:SS" -> "DD.MM.YYYY"
    const parts = dateString.split(' ')[0].split('-');
    if (parts.length === 3) {
      return `${parts[2]}.${parts[1]}.${parts[0]}`;
    }
    return dateString;
  };

  // Get phone from order
  const getPhone = (order) => {
    if (order.primaryContact?.phone?.length > 0) {
      return order.primaryContact.phone[0];
    }
    return '-';
  };

  // Get client name
  const getClientName = (order) => {
    const fName = order.fName || order.primaryContact?.fName || '';
    const lName = order.lName || order.primaryContact?.lName || '';
    return `${fName} ${lName}`.trim() || '-';
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedClient('');
    setClientSearchTerm('');
    setSelectedMonth('');
    setSelectedYear(new Date().getFullYear().toString());
  };

  return {
    // Data
    orders,
    filteredOrders,
    loading,
    error,
    totalSum,

    // Filter values
    selectedClient,
    selectedMonth,
    selectedYear,

    // Client search
    clientSearchTerm,
    showClientDropdown,
    setShowClientDropdown,
    filteredClients,
    handleSelectClient,
    handleClientInputChange,
    clientDropdownRef,

    // Filter setters
    setSelectedClient,
    setSelectedMonth,
    setSelectedYear,
    clearFilters,

    // Filter options
    uniqueClients,
    uniqueMonths,
    uniqueYears,

    // Helpers
    formatDate,
    getPhone,
    getClientName
  };
}
