import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { aggregateDailyStats } from '@/hooks/usePageTracking';
import { 
  LogOut, Users, FileText, Edit, Loader2, DollarSign, TrendingUp, 
  Eye, ShoppingCart, Calendar, Award, Phone, Mail, MapPin,
  RefreshCw, Download, Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const EnhancedAdminDashboardPage = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [dashboardData, setDashboardData] = useState({
    summary: {},
    recentOrders: [],
    revenuetrend: [],
    userGrowth: [],
    customers: []
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState(30);

  // Fetch all dashboard data
  const fetchDashboardData = useCallback(async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true);
      else setLoading(true);

      // Fetch summary data
      const { data: summary, error: summaryError } = await supabase
        .from('admin_dashboard_summary')
        .select('*')
        .single();

      if (summaryError) throw summaryError;

      // Fetch recent orders
      let finalOrders = [];
      const { data: recentOrders, error: ordersError } = await supabase
        .rpc('get_recent_orders', { days_limit: dateRange });

      if (ordersError) {
        console.error('Orders error:', ordersError);
        // Fallback: try direct table query without joins first
        const { data: directOrders, error: directError } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);

        if (directError) {
          console.error('Direct orders error:', directError);
        } else {
          console.log('Direct orders fetched:', directOrders?.length || 0);
          finalOrders = directOrders || [];
        }
      } else {
        console.log('Orders fetched via RPC:', recentOrders?.length || 0);
        finalOrders = recentOrders || [];
      }

      // Fetch revenue trend
      const { data: revenueData, error: revenueError } = await supabase
        .rpc('get_revenue_trend', { days_back: dateRange });

      if (revenueError) console.warn('Revenue error:', revenueError);

      // Fetch user growth
      const { data: userGrowthData, error: userGrowthError } = await supabase
        .rpc('get_user_growth', { days_back: dateRange });

      if (userGrowthError) console.warn('User growth error:', userGrowthError);

      // Fetch customers
      const { data: customers, error: customersError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (customersError) {
        console.error('Customers error:', customersError);
      } else {
        console.log('Customers fetched:', customers?.length || 0);
      }

      setDashboardData({
        summary: summary || {},
        recentOrders: finalOrders,
        revenueData: revenueData || [],
        userGrowthData: userGrowthData || [],
        customers: customers || []
      });

    } catch (error) {
      toast({ 
        title: "Error fetching dashboard data", 
        description: error.message, 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [toast, dateRange]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  const handleAggregateStats = async () => {
    try {
      setRefreshing(true);
      toast({ title: "Aggregating visitor stats...", description: "This may take a moment." });

      // Aggregate stats for today and yesterday
      await aggregateDailyStats(new Date());
      await aggregateDailyStats(new Date(Date.now() - 24 * 60 * 60 * 1000));

      toast({ title: "Success", description: "Visitor stats aggregated successfully." });

      // Refresh dashboard data
      fetchDashboardData(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to aggregate visitor stats.",
        variant: "destructive"
      });
    } finally {
      setRefreshing(false);
    }
  };
  
  const handleEditChange = (e) => {
    setEditingCustomer({ ...editingCustomer, [e.target.name]: e.target.value });
  };
  
  const handleSaveChanges = async () => {
    if (!editingCustomer) return;
    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: editingCustomer.name,
          email: editingCustomer.email,
          phone: editingCustomer.phone,
          industry: editingCustomer.industry,
          job_title: editingCustomer.job_title,
          notes: editingCustomer.notes,
          role: editingCustomer.role
        })
        .eq('id', editingCustomer.id);
        
      if (error) throw error;
      
      toast({ title: "Success", description: "Customer profile updated." });
      setEditingCustomer(null);
      fetchDashboardData(true);
    } catch(error) {
      toast({ title: "Error saving changes", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  // Summary cards data
  const summaryCards = [
    {
      title: "Total Revenue",
      value: `$${dashboardData.summary.total_revenue || 0}`,
      change: `$${dashboardData.summary.revenue_30d || 0} this month`,
      icon: DollarSign,
      color: "text-green-600"
    },
    {
      title: "Total Orders",
      value: dashboardData.summary.total_orders || 0,
      change: `${dashboardData.summary.orders_30d || 0} this month`,
      icon: ShoppingCart,
      color: "text-blue-600"
    },
    {
      title: "Total Users",
      value: dashboardData.summary.total_users || 0,
      change: `${dashboardData.summary.new_users_30d || 0} new this month`,
      icon: Users,
      color: "text-purple-600"
    },
    {
      title: "Resumes Analyzed",
      value: dashboardData.summary.resumes_analyzed || 0,
      change: `${dashboardData.summary.resumes_analyzed_confirmed || 0} confirmed, ${dashboardData.summary.resumes_analyzed_pending || 0} pending`,
      icon: Award,
      color: "text-orange-600"
    },
    {
      title: "Visitors (30d)",
      value: dashboardData.summary.visitors_30d || 0,
      change: `${dashboardData.summary.pageviews_30d || 0} page views`,
      icon: Eye,
      color: "text-indigo-600"
    },
    {
      title: "Conversion Rate",
      value: (dashboardData.summary.total_users > 0 && dashboardData.summary.completed_orders >= 0)
        ? `${(((dashboardData.summary.completed_orders || 0) / dashboardData.summary.total_users) * 100).toFixed(1)}%`
        : "0%",
      change: `${dashboardData.summary.completed_orders || 0} completed of ${dashboardData.summary.total_orders || 0} total orders`,
      icon: TrendingUp,
      color: "text-cyan-600"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Enhanced Admin Dashboard - ProResume Designs</title>
      </Helmet>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-40 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
              <Button
                onClick={handleRefresh}
                variant="ghost"
                size="sm"
                disabled={refreshing}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
              <Button
                onClick={handleAggregateStats}
                variant="outline"
                size="sm"
                disabled={refreshing}
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                Aggregate Visitor Stats
              </Button>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(Number(e.target.value))}
                className="text-sm border rounded px-3 py-1"
              >
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
              </select>
              <Button onClick={handleLogout} variant="ghost">
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* Summary Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
                {summaryCards.map((card, index) => (
                  <motion.div
                    key={card.title}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white p-6 rounded-lg shadow-sm border"
                  >
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg ${card.color} bg-opacity-10`}>
                        <card.icon className={`h-6 w-6 ${card.color}`} />
                      </div>
                    </div>
                    <div className="mt-4">
                      <h3 className="text-2xl font-bold text-gray-900">{card.value}</h3>
                      <p className="text-sm font-medium text-gray-500">{card.title}</p>
                      <p className="text-xs text-gray-400 mt-1">{card.change}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Tabbed Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Orders */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white p-6 rounded-lg shadow-sm border"
                  >
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Orders</h3>
                    <div className="space-y-3">
                      {dashboardData.recentOrders.slice(0, 5).map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <div>
                            <p className="font-medium text-sm">{order.user_email || (order.profiles?.email) || 'Guest'}</p>
                            <p className="text-xs text-gray-500">{order.user_name || (order.profiles?.name) || (order.user_id ? `User ID: ${order.user_id.slice(0, 8)}` : `Order #${order.id.slice(0, 8)}`)}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-sm">${(order.total_amount / 100).toFixed(2)}</p>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              order.status === 'completed' ? 'bg-green-100 text-green-800' :
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Top Industries */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white p-6 rounded-lg shadow-sm border"
                  >
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Top Industries</h3>
                    <div className="space-y-3">
                      {Object.entries(
                        dashboardData.customers
                          .filter(c => c.industry)
                          .reduce((acc, customer) => {
                            acc[customer.industry] = (acc[customer.industry] || 0) + 1;
                            return acc;
                          }, {})
                      )
                        .sort(([,a], [,b]) => b - a)
                        .slice(0, 5)
                        .map(([industry, count]) => (
                          <div key={industry} className="flex items-center justify-between">
                            <span className="text-sm font-medium">{industry}</span>
                            <span className="text-sm text-gray-500">{count} users</span>
                          </div>
                        ))}
                    </div>
                  </motion.div>
                </div>
              </TabsContent>

              {/* Orders Tab */}
              <TabsContent value="orders">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-sm border"
                >
                  <div className="p-6 border-b">
                    <h3 className="text-lg font-medium text-gray-900">All Orders</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {dashboardData.recentOrders.length > 0 ? dashboardData.recentOrders.map((order) => (
                          <tr key={order.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {order.user_email || (order.profiles?.email) || 'Guest'}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {order.user_name || (order.profiles?.name) || (order.user_id ? `User ID: ${order.user_id.slice(0, 8)}` : 'N/A')}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              Order #{order.id.slice(0, 8)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              ${(order.total_amount / 100).toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(order.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                              No orders found. Check console for errors.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              </TabsContent>

              {/* Users Tab */}
              <TabsContent value="users">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-sm border"
                >
                  <div className="p-6 border-b">
                    <h3 className="text-lg font-medium text-gray-900">User Management</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Industry</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ATS Score</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {dashboardData.customers.length > 0 ? dashboardData.customers.map((customer) => (
                          <tr key={customer.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{customer.name || 'N/A'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{customer.email}</div>
                              <div className="text-sm text-gray-500">{customer.phone || 'N/A'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {customer.industry || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {customer.ats_score ? (
                                <span className="text-sm font-medium text-gray-900">{customer.ats_score}</span>
                              ) : (
                                <span className="text-sm text-gray-400">Not analyzed</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                customer.role === 'admin' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {customer.role || 'user'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingCustomer(customer)}
                              >
                                <Edit className="h-4 w-4 mr-1" /> Edit
                              </Button>
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                              No users found. Check console for errors or RLS policies.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white p-6 rounded-lg shadow-sm border"
                  >
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Key Metrics</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                        <span className="text-sm font-medium">Average ATS Score</span>
                        <span className="text-lg font-bold text-blue-600">
                          {dashboardData.summary.avg_ats_score || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                        <span className="text-sm font-medium">Conversion Rate (users → orders)</span>
                        <span className="text-lg font-bold text-green-600">
                          {(dashboardData.summary.total_users > 0 && dashboardData.summary.completed_orders >= 0)
                            ? `${(((dashboardData.summary.completed_orders || 0) / dashboardData.summary.total_users) * 100).toFixed(1)}%`
                            : "0%"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
                        <span className="text-sm font-medium">Avg Revenue per User</span>
                        <span className="text-lg font-bold text-purple-600">
                          ${dashboardData.summary.total_users > 0 
                            ? (dashboardData.summary.total_revenue / dashboardData.summary.total_users).toFixed(2)
                            : "0.00"}
                        </span>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white p-6 rounded-lg shadow-sm border"
                  >
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Resume Stats</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Resumes Uploaded</span>
                        <span className="font-semibold">{dashboardData.summary.resumes_uploaded || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Analyzed</span>
                        <span className="font-semibold">{dashboardData.summary.resumes_analyzed || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Confirmed (with accounts)</span>
                        <span className="font-semibold">{dashboardData.summary.resumes_analyzed_confirmed || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Pending confirmation</span>
                        <span className="font-semibold">{dashboardData.summary.resumes_analyzed_pending || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Conversion Rate (analysis → account)</span>
                        <span className="font-semibold">
                          {dashboardData.summary.resumes_analyzed > 0
                            ? `${((dashboardData.summary.resumes_analyzed_confirmed / dashboardData.summary.resumes_analyzed) * 100).toFixed(1)}%`
                            : "0%"}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
        
        {/* Edit Customer Dialog */}
        <Dialog open={!!editingCustomer} onOpenChange={() => setEditingCustomer(null)}>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle>Edit Customer Profile</DialogTitle>
              <DialogDescription>
                Make changes to the user's profile. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            {editingCustomer && (
              <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Name</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    value={editingCustomer.name || ''} 
                    onChange={handleEditChange} 
                    className="col-span-3" 
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">Email</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    value={editingCustomer.email || ''} 
                    onChange={handleEditChange} 
                    className="col-span-3" 
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right">Phone</Label>
                  <Input 
                    id="phone" 
                    name="phone" 
                    value={editingCustomer.phone || ''} 
                    onChange={handleEditChange} 
                    className="col-span-3" 
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="industry" className="text-right">Industry</Label>
                  <Input 
                    id="industry" 
                    name="industry" 
                    value={editingCustomer.industry || ''} 
                    onChange={handleEditChange} 
                    className="col-span-3" 
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="job_title" className="text-right">Job Title</Label>
                  <Input 
                    id="job_title" 
                    name="job_title" 
                    value={editingCustomer.job_title || ''} 
                    onChange={handleEditChange} 
                    className="col-span-3" 
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="notes" className="text-right">Notes</Label>
                  <Input 
                    id="notes" 
                    name="notes" 
                    value={editingCustomer.notes || ''} 
                    onChange={handleEditChange} 
                    className="col-span-3" 
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right">Role</Label>
                  <select
                    id="role"
                    name="role"
                    value={editingCustomer.role || 'user'}
                    onChange={handleEditChange}
                    className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
            )}
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleSaveChanges} disabled={isSaving}>
                {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : 'Save Changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default EnhancedAdminDashboardPage;