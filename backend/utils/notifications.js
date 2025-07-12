const createNotification = async (prisma, data) => {
  try {
    await prisma.notification.create({
      data: {
        type: data.type,
        message: data.message,
        userId: data.userId,
        relatedId: data.relatedId || null,
        relatedType: data.relatedType || null
      }
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

const createMentionNotifications = async (prisma, content, authorId, relatedId, relatedType) => {
  // Extract @username mentions from content (both plain text and HTML)
  const mentionRegex = /@(\w+)/g;
  const mentions = content.match(mentionRegex);
  
  if (!mentions) return;
  
  const usernames = [...new Set(mentions.map(mention => mention.slice(1)))]; // Remove @ symbol and dedupe
  
  // Find users by username
  const users = await prisma.user.findMany({
    where: {
      username: {
        in: usernames
      }
    },
    select: { id: true, username: true }
  });
  
  // Get context based on relatedType
  let contextInfo = null;
  if (relatedType === 'QUESTION') {
    contextInfo = await prisma.question.findUnique({
      where: { id: relatedId },
      select: { title: true }
    });
  } else if (relatedType === 'ANSWER') {
    const answer = await prisma.answer.findUnique({
      where: { id: relatedId },
      include: { question: { select: { id: true, title: true } } }
    });
    contextInfo = answer?.question;
  }
  
  // Create notifications for mentioned users (except the author)
  for (const user of users) {
    if (user.id !== authorId) {
      let message;
      if (relatedType === 'QUESTION' && contextInfo) {
        const truncatedTitle = contextInfo.title.length > 60 
          ? contextInfo.title.substring(0, 60) + '...' 
          : contextInfo.title;
        message = `You were mentioned in question: ${truncatedTitle}`;
      } else if (relatedType === 'ANSWER' && contextInfo) {
        const truncatedTitle = contextInfo.title.length > 60 
          ? contextInfo.title.substring(0, 60) + '...' 
          : contextInfo.title;
        message = `You were mentioned in an answer to: ${truncatedTitle}`;
      } else {
        message = `You were mentioned in a ${relatedType.toLowerCase()}`;
      }
      
      await createNotification(prisma, {
        type: 'MENTION',
        message,
        userId: user.id,
        relatedId: contextInfo?.id || relatedId,
        relatedType: relatedType === 'ANSWER' ? 'QUESTION' : relatedType
      });
    }
  }
};

module.exports = {
  createNotification,
  createMentionNotifications
};
