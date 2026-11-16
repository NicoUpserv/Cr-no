import { useLocalSearchParams } from 'expo-router';

import { EcranConversation } from '@/ecrans/conversation';

export default function ConversationDepuisFiche() {
  const { eleveId } = useLocalSearchParams<{ eleveId: string }>();
  return <EcranConversation eleveId={eleveId} vue="direction" />;
}
