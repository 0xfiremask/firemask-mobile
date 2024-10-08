import Engine from '../../core/Engine';
import {
  ResultType,
  SecurityAlertResponse,
} from '../../components/Views/confirmations/components/BlockaidBanner/BlockaidBanner.types';
import { BLOCKAID_SUPPORTED_CHAIN_IDS, getDecimalChainId } from '../networks';
import { store } from '../../store';
import { selectChainId } from '../../selectors/networkController';
import type { TransactionMeta } from '@metamask/transaction-controller';

interface TransactionSecurityAlertResponseType {
  securityAlertResponses: Record<string, SecurityAlertResponse>;
}

export type TransactionType = TransactionMeta &
  TransactionSecurityAlertResponseType;

export const isSupportedChainId = (chainId: string) => {
  /**
   * Quite a number of our test cases return undefined as chainId from state.
   * In such cases, the tests don't really care about the chainId.
   * So, this treats undefined chainId as mainnet for now.
   * */
  if (chainId === undefined) {
    return true;
  }

  const isSupported = BLOCKAID_SUPPORTED_CHAIN_IDS.some(
    (id) => getDecimalChainId(id) === getDecimalChainId(chainId),
  );

  return isSupported;
};

export const isBlockaidSupportedOnCurrentChain = () => {
  const chainId = selectChainId(store.getState());
  return isSupportedChainId(chainId);
};

export const isBlockaidPreferenceEnabled = () => {
  const { PreferencesController } = Engine.context;
  return PreferencesController.state.securityAlertsEnabled;
};

export const isBlockaidFeatureEnabled = () =>
  isBlockaidSupportedOnCurrentChain() && isBlockaidPreferenceEnabled();

export const getBlockaidMetricsParams = (
  securityAlertResponse?: SecurityAlertResponse,
) => {
  // TODO: Replace "any" with type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const additionalParams: Record<string, any> = {};

  if (securityAlertResponse && isBlockaidFeatureEnabled()) {
    const { result_type, reason, providerRequestsCount, source } =
      securityAlertResponse;

    additionalParams.security_alert_response = result_type;
    additionalParams.security_alert_reason = reason;
    additionalParams.security_alert_source = source;

    if (result_type === ResultType.Malicious) {
      additionalParams.ui_customizations = ['flagged_as_malicious'];
    } else if (result_type === ResultType.RequestInProgress) {
      additionalParams.ui_customizations = ['security_alert_loading'];
      additionalParams.security_alert_response = 'loading';
    }

    // add counts of each RPC call
    if (providerRequestsCount) {
      Object.keys(providerRequestsCount).forEach((key: string) => {
        const metricKey = `ppom_${key}_count`;
        additionalParams[metricKey] = providerRequestsCount[key];
      });
    }
  }

  return additionalParams;
};

export const getBlockaidTransactionMetricsParams = (
  transaction: TransactionType,
) => {
  let blockaidParams = {};

  if (!transaction) {
    return blockaidParams;
  }

  const { securityAlertResponses, id } = transaction;
  const securityAlertResponse = securityAlertResponses?.[id];
  if (securityAlertResponse) {
    blockaidParams = getBlockaidMetricsParams(securityAlertResponse);
  }

  return blockaidParams;
};
