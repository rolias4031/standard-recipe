import AdminDock from 'components/admin/AdminDock';
import AdminView from 'components/admin/AdminView';
import React from 'react';

function AdminPage() {
  return <AdminDock>{(data) => <AdminView {...data} />}</AdminDock>;
}

export default AdminPage;
