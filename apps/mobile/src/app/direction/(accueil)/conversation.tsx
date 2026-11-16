import { useLocalSearchParams } from 'expo-router';

import { EcranConversation } from '@/ecrans/conversation';

export default function ConversationDirection() {
  const { eleveId } = useLocalSearchParams<{ eleveId: string }>();
  return <EcranConversation eleveId={eleveId} vue="direction" />;
}
