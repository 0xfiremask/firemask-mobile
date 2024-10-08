// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck - Notifications team directory
import React from 'react';
import { Dimensions, TouchableOpacity } from 'react-native';
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
  PanGestureHandlerProps,
} from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedGestureHandler,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import Icon, {
  IconColor,
  IconName,
  IconSize,
} from '../../../../component-library/components/Icons/Icon';
import { NotificationListStyles } from '../List/styles';

interface NotificationRootProps
  extends Pick<PanGestureHandlerProps, 'simultaneousHandlers'> {
  children: React.ReactNode;
  styles: NotificationListStyles;
  handleOnPress: () => void;
  onDismiss?: () => void;
  isRead?: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DELETE_BUTTON_WIDTH = -SCREEN_WIDTH * 0.3;
const SWIPE_THRESHOLD = DELETE_BUTTON_WIDTH;

function NotificationRoot({
  children,
  handleOnPress,
  styles,
  onDismiss,
  simultaneousHandlers,
  isRead,
}: NotificationRootProps) {
  const transX = useSharedValue(0);
  const itemHeight = useSharedValue();
  const paddingVertical = useSharedValue(10);
  const opacity = useSharedValue(1);

  const panGesture = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
    onActive: (event: PanGestureHandlerGestureEvent) => {
      const isSwipingLeft = event.translationX > 0;

      if (isSwipingLeft) {
        transX.value = 0;
        return;
      }

      transX.value = event.translationX;
    },
    onEnd: () => {
      const isDismissed = transX.value < SWIPE_THRESHOLD;
      if (isDismissed) {
        transX.value = withTiming(-SCREEN_WIDTH);
        itemHeight.value = withTiming(0);
        paddingVertical.value = withTiming(0);
        opacity.value = withTiming(0, undefined, (isFinished: boolean) => {
          if (isFinished && onDismiss) {
            runOnJS(onDismiss);
          }
        });
      } else {
        transX.value = withTiming(0);
      }
    },
  });

  const rChildrenStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: transX.value }],
    ...styles.itemContainer,
    ...(!isRead ? styles.unreadItemContainer : styles.readItemContainer),
  }));

  const rIconStyle = useAnimatedStyle(() => {
    const opct = withTiming(transX.value < SWIPE_THRESHOLD ? 1 : 0, {
      duration: 300,
    });

    return { opacity: opct };
  });

  return (
    <Animated.View>
      <PanGestureHandler
        simultaneousHandlers={simultaneousHandlers}
        onGestureEvent={panGesture}
      >
        <Animated.View onPress={handleOnPress} style={rChildrenStyle}>
          <TouchableOpacity
            onPress={handleOnPress}
            style={styles.menuItemContainer}
          >
            {children}
          </TouchableOpacity>
        </Animated.View>
      </PanGestureHandler>
      <Animated.View style={[styles.trashIconContainer, rIconStyle]}>
        <Icon
          size={IconSize.Md}
          name={IconName.Trash}
          color={IconColor.Alternative}
        />
      </Animated.View>
    </Animated.View>
  );
}

export default NotificationRoot;
