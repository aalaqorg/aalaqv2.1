import { prisma } from "../lib/prisma";
import { User, PublishedStory, Message } from "../types";

export const serverStorageService = {
  // --- User Management ---
  registerUser: async (userData: Partial<User>) => {
    if (!userData.username) throw new Error("Username required");
    
    return await prisma.user.create({
      data: {
        username: userData.username,
        email: userData.email,
        password: userData.password, // In production, hash this!
        rewardPoints: 0,
        huroofCompleted: 0,
        streak: 1,
        lastActivityDate: new Date(),
      }
    });
  },

  getUser: async (username: string) => {
    return await prisma.user.findUnique({
      where: { username },
      include: {
        stories: true,
        bookmarks: true,
      }
    });
  },

  loginUser: async (identifier: string, password?: string) => {
    // Admin Backdoor
    if (identifier === "aalaq@gmail.com" && password === "7865433&*^%$#T$^") {
        return {
            id: "admin-superuser-id",
            username: "Aalaq Admin",
            email: "aalaq@gmail.com",
            rewardPoints: 99999,
            huroofCompleted: 0,
            streak: 999,
            lastActivityDate: new Date(),
            isAdmin: true // We might need to add this to the type or just use email check
        } as unknown as User;
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: identifier },
          { email: identifier }
        ],
        // password: password // Add if hashing is implemented
      }
    });
    
    if (user) {
        // Update streak and lastActivityDate
        const today = new Date();
        today.setHours(0,0,0,0);
        
        const lastActivity = user.lastActivityDate ? new Date(user.lastActivityDate) : null;
        if (lastActivity) lastActivity.setHours(0,0,0,0);

        let streak = user.streak;
        if (!lastActivity || lastActivity.getTime() < today.getTime()) {
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            
            if (lastActivity && lastActivity.getTime() === yesterday.getTime()) {
                streak += 1;
            } else {
                streak = 1;
            }
            
            return await prisma.user.update({
                where: { id: user.id },
                data: {
                    streak,
                    lastActivityDate: new Date(),
                    rewardPoints: { increment: 2 }
                }
            });
        }
        return user;
    }
    return null;
  },

  // --- Stories ---
  getStories: async () => {
    const stories = await prisma.story.findMany({
      orderBy: { timestamp: 'desc' },
      include: {
        author: {
            select: { username: true }
        },
        _count: {
            select: { votes: true, ratings: true }
        }
      }
    });

    // Map to PublishedStory type
    return stories.map(s => ({
        ...s,
        storyContent: s.content, // Map DB 'content' to frontend 'storyContent'
        author: s.author.username,
        votes: s._count.votes,
        timestamp: s.timestamp.getTime(),
        // Needs more fields to match PublishedStory exactly
        ratingSum: 0, // Simplified for now
        ratingCount: s._count.ratings,
        genre: s.genre,
    }));
  },

  publishStory: async (storyData: any) => {
    const user = await prisma.user.findUnique({ where: { username: storyData.author } });
    if (!user) throw new Error("User not found");

    const userStoriesCount = await prisma.story.count({ where: { authorId: user.id } });
    if (userStoriesCount >= 3) throw new Error("Story limit reached");

    return await prisma.story.create({
      data: {
        title: storyData.title,
        content: storyData.storyContent,
        moral: storyData.moral,
        genre: storyData.genre || 'Wisdom',
        references: storyData.references,
        authorId: user.id,
        aiGenerated: true,
      }
    });
  },

  deleteStory: async (id: string) => {
    return await prisma.story.delete({
      where: { id }
    });
  },

  voteStory: async (storyId: string, username: string) => {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) throw new Error("User not found");

    // Check if vote exists
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_storyId: {
          userId: user.id,
          storyId
        }
      }
    });

    if (existingVote) {
       // Already voted, maybe untoggle? Or just do nothing? 
       // For now, let's assume upvote only, so ignore if already voted
       return;
    }

    return await prisma.vote.create({
      data: {
        userId: user.id,
        storyId
      }
    });
  },

  toggleBookmark: async (storyId: string, username: string) => {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) throw new Error("User not found");

    const existing = await prisma.bookmark.findUnique({
      where: {
        userId_storyId: {
          userId: user.id,
          storyId
        }
      }
    });

    if (existing) {
        return await prisma.bookmark.delete({
            where: { id: existing.id }
        });
    } else {
        return await prisma.bookmark.create({
            data: {
                userId: user.id,
                storyId
            }
        });
    }
  },

  rateStory: async (storyId: string, username: string, score: number) => {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) throw new Error("User not found");

    // Check if already rated
    const existing = await prisma.rating.findUnique({
        where: {
            userId_storyId: {
                userId: user.id,
                storyId
            }
        }
    });

    if (existing) {
        return await prisma.rating.update({
            where: { id: existing.id },
            data: { score }
        });
    } else {
        return await prisma.rating.create({
            data: {
                userId: user.id,
                storyId,
                score
            }
        });
    }
  },

  // --- Messaging ---
  sendMessage: async (from: string, to: string, content: string) => {
    const sender = await prisma.user.findUnique({ where: { username: from } });
    const receiver = await prisma.user.findUnique({ where: { username: to } });

    if (!sender || !receiver) throw new Error("User not found");

    return await prisma.message.create({
      data: {
        content,
        senderId: sender.id,
        receiverId: receiver.id,
        timestamp: new Date(),
        read: false
      }
    });
  },

  getInbox: async (username: string) => {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return [];

    // Get latest message from each conversation or just all received messages
    const messages = await prisma.message.findMany({
      where: { receiverId: user.id },
      orderBy: { timestamp: 'desc' },
      include: {
        sender: { select: { username: true } },
        receiver: { select: { username: true } }
      }
    });

    return messages.map(m => ({
        id: m.id,
        from: m.sender.username,
        to: m.receiver.username,
        content: m.content,
        timestamp: m.timestamp.getTime(),
        read: m.read
    }));
  },

  getConversation: async (username1: string, username2: string) => {
    const u1 = await prisma.user.findUnique({ where: { username: username1 } });
    const u2 = await prisma.user.findUnique({ where: { username: username2 } });

    if (!u1 || !u2) return [];

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: u1.id, receiverId: u2.id },
          { senderId: u2.id, receiverId: u1.id }
        ]
      },
      orderBy: { timestamp: 'asc' },
      include: {
        sender: { select: { username: true } },
        receiver: { select: { username: true } }
      }
    });

    return messages.map(m => ({
        id: m.id,
        from: m.sender.username,
        to: m.receiver.username,
        content: m.content,
        timestamp: m.timestamp.getTime(),
        read: m.read
    }));
  },

  markAsRead: async (messageId: string) => {
    return await prisma.message.update({
      where: { id: messageId },
      data: { read: true }
    });
  }
};
