import React from 'react';
import { fireEvent } from '@testing-library/react-native';

import renderWithProvider, {
  DeepPartial,
} from '../../../util/test/renderWithProvider';
import { backgroundState } from '../../../util/test/initial-root-state';
import { resetOriginSpamState } from '../../../core/redux/slices/originThrottling';
import OriginSpamModal, {
  BLOCK_BUTTON_TEST_ID,
  CONTINUE_BUTTON_TEST_ID,
} from './OriginSpamModal';
import { RootState } from '../../../reducers';

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => jest.fn(),
}));

const mockAction = { type: 'MOCK_ACTION' };
jest.mock('../../../core/redux/slices/originThrottling', () => ({
  resetOriginSpamState: jest.fn().mockImplementation(() => mockAction),
}));

jest.mock(
  '../../../component-library/components/BottomSheets/BottomSheet',
  () =>
    ({ children }: { children: React.ReactElement }) =>
      <>{children}</>,
);

const SCAM_ORIGIN_MOCK = 'scam.origin';
const NAVIGATION_PARAMS_MOCK = {
  params: {
    origin: SCAM_ORIGIN_MOCK,
  },
};

const mockInitialState: DeepPartial<RootState> = {
  engine: {
    backgroundState: {
      ...backgroundState,
    },
  },
};

describe('OriginSpamModal', () => {
  const mockResetOriginSpamState = jest.mocked(resetOriginSpamState);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('renders', () => {
    it('spam modal content by default', () => {
      const { toJSON } = renderWithProvider(
        <OriginSpamModal route={NAVIGATION_PARAMS_MOCK} />,
        {
          state: mockInitialState,
        },
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('SiteBlockedContent if user opt in to block dapp', () => {
      const wrapper = renderWithProvider(
        <OriginSpamModal route={NAVIGATION_PARAMS_MOCK} />,
        {
          state: mockInitialState,
        },
      );
      fireEvent.press(wrapper.getByTestId(BLOCK_BUTTON_TEST_ID));
      expect(wrapper.toJSON()).toMatchSnapshot();
    });
  });

  it('reset dapp spam state on clicking continue button', () => {
    const wrapper = renderWithProvider(
      <OriginSpamModal route={NAVIGATION_PARAMS_MOCK} />,
      {
        state: mockInitialState,
      },
    );
    fireEvent.press(wrapper.getByTestId(CONTINUE_BUTTON_TEST_ID));

    expect(mockResetOriginSpamState).toHaveBeenCalledTimes(1);
  });
});
