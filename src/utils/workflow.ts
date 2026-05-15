export type NextAction = {
  label: string;
  category: 'action' | 'waiting' | 'ready';
  priority: number;
};

export function getNextAction(booking: any): NextAction {
  const { 
    pipeline_stage, 
    status, 
    contract_status, 
    deposit_paid, 
    final_paid, 
    review_requested, 
    event_date 
  } = booking;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const shootDate = new Date(event_date);
  shootDate.setHours(0, 0, 0, 0);

  // 1. INQUIRY STAGE
  if (pipeline_stage === 'lead') {
    if (status === 'pending') {
      return { label: 'Confirm Date/Time', category: 'action', priority: 1 };
    }
    return { label: 'Send Contract', category: 'action', priority: 2 };
  }

  // 2. CONFIRMED STAGE
  if (pipeline_stage === 'confirmed') {
    if (contract_status !== 'signed') {
      return { label: 'Collect Signed Contract', category: 'waiting', priority: 3 };
    }
    if (!deposit_paid) {
      return { label: 'Collect Deposit', category: 'waiting', priority: 4 };
    }
    
    // Check if shoot is coming up or passed
    if (shootDate < today) {
      return { label: 'Start Editing', category: 'action', priority: 1 };
    }
    
    const diffDays = Math.ceil((shootDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    if (diffDays <= 2) {
      return { label: 'Prep for Shoot', category: 'action', priority: 1 };
    }
    
    return { label: 'Wait for Shoot Day', category: 'waiting', priority: 10 };
  }

  // 3. SHOOTING STAGE
  if (pipeline_stage === 'shooting') {
    if (shootDate < today) {
      return { label: 'Start Editing', category: 'action', priority: 2 };
    }
    return { label: 'Shoot Session', category: 'action', priority: 1 };
  }

  // 4. EDITING STAGE
  if (pipeline_stage === 'editing') {
    return { label: 'Deliver Gallery', category: 'ready', priority: 1 };
  }

  // 5. DELIVERED STAGE
  if (pipeline_stage === 'delivered') {
    if (!final_paid) {
      return { label: 'Collect Final Payment', category: 'waiting', priority: 5 };
    }
    if (!review_requested) {
      return { label: 'Request Review', category: 'action', priority: 6 };
    }
    return { label: 'Archive Project', category: 'action', priority: 7 };
  }

  return { label: 'System Check', category: 'waiting', priority: 99 };
}

export function getInquiryAction(inquiry: any): NextAction {
  if (inquiry.status === 'new') {
    return { label: 'Reply to Inquiry', category: 'action', priority: 1 };
  }
  if (inquiry.status === 'replied') {
    return { label: 'Wait for Response', category: 'waiting', priority: 2 };
  }
  return { label: 'Archive Inquiry', category: 'action', priority: 3 };
}
