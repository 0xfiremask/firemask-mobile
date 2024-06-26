import React from 'react';
import useApprovalRequest from '../../Views/confirmations/hooks/useApprovalRequest';
import { ApprovalTypes } from '../../../core/RPCMethods/RPCMethodMiddleware';
import ApprovalModal from '../ApprovalModal';
import AccountApproval from '../../UI/AccountApproval';

export interface ConnectApprovalProps {
  // TODO: Replace "any" with type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  navigation: any;
}

const ConnectApproval = (props: ConnectApprovalProps) => {
  const { approvalRequest, pageMeta, onConfirm, onReject } =
    useApprovalRequest();

  return (
    <ApprovalModal
      isVisible={approvalRequest?.type === ApprovalTypes.CONNECT_ACCOUNTS}
      onCancel={onReject}
    >
      <AccountApproval
        onCancel={onReject}
        onConfirm={onConfirm}
        navigation={props.navigation}
        currentPageInformation={pageMeta}
      />
    </ApprovalModal>
  );
};

export default ConnectApproval;
