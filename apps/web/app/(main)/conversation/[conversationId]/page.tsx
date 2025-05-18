interface ConversationIdPageProps {
  params: {
    conversationId: string;
  };
}

const ConversationIdPage = async ({ params }: ConversationIdPageProps) => {
  const conversationId = await (params.conversationId);

  return (
    <div className="w-full flex justify-center">
      <h1>this my coversation Id page {conversationId}</h1>
    </div>
  );
};

export default ConversationIdPage;
