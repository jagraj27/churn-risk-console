import { useState } from "react";

import CustomerList from "./pages/CustomerList";
import CustomerDetail from "./pages/CustomerDetail";

function App() {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    null,
  );

  if (selectedCustomerId) {
    return (
      <CustomerDetail
        customerId={selectedCustomerId}
        onBack={() => setSelectedCustomerId(null)}
      />
    );
  }

  return <CustomerList onSelectCustomer={setSelectedCustomerId} />;
}

export default App;
