import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleRefresh = () => {
    // Reset the error state to allow the app to re-render
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 bg-background items-center justify-center p-6">
          <View className="items-center mb-8">
            <View className="w-24 h-24 rounded-full bg-destructive/10 items-center justify-center mb-4">
              <IconSymbol name="exclamationmark.triangle.fill" size={48} color="#ef4444" />
            </View>
            <Text className="text-2xl font-bold text-foreground mb-2 text-center">
              Oops! Something went wrong
            </Text>
            <Text className="text-base text-muted text-center mb-6">
              The app encountered an unexpected error. Don't worry, you can refresh to continue.
            </Text>
          </View>

          {/* Error Details (collapsible) */}
          {__DEV__ && this.state.error && (
            <ScrollView className="w-full max-h-48 bg-surface rounded-2xl p-4 mb-6 border border-border">
              <Text className="text-xs text-destructive font-mono mb-2">
                {this.state.error.toString()}
              </Text>
              {this.state.errorInfo && (
                <Text className="text-xs text-muted font-mono">
                  {this.state.errorInfo.componentStack}
                </Text>
              )}
            </ScrollView>
          )}

          {/* Action Buttons */}
          <View className="w-full gap-3">
            <TouchableOpacity
              onPress={this.handleRefresh}
              className="bg-primary py-4 rounded-2xl items-center active:opacity-80"
            >
              <View className="flex-row items-center gap-2">
                <IconSymbol name="arrow.clockwise" size={20} color="white" />
                <Text className="text-primary-foreground font-bold text-lg">
                  Refresh App
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                this.setState({
                  hasError: false,
                  error: null,
                  errorInfo: null,
                });
              }}
              className="bg-surface py-4 rounded-2xl items-center border border-border active:opacity-80"
            >
              <Text className="text-foreground font-semibold text-base">
                Try Again
              </Text>
            </TouchableOpacity>
          </View>

          {/* Help Text */}
          <Text className="text-sm text-muted text-center mt-6">
            If the problem persists, please contact support
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}
