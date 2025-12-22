import React, { FormEvent, useMemo, useState } from 'react';
import {
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  FaceSmileIcon,
  EllipsisVerticalIcon,
} from '@heroicons/react/24/outline';
import { cn } from '../utils/cn';
import { ChatMessage, ChatThread, User } from '../types';
import { 
  formatRelativeTime as formatRelativeTimeUtil, 
  formatDateLabel as formatDateLabelUtil, 
  formatTime as formatTimeUtil,
  parseBackendTimestamp 
} from '../utils/dateUtils';

interface ChatConversation {
  user: User;
  thread: ChatThread;
  isOnline: boolean;
  priority: 'normal' | 'high' | 'low';
  status: 'unresolved' | 'resolved';
}

const ADMIN_ID = 'admin';
const ROLE_LABELS: Record<User['role'], string> = {
  student: 'Sinh viên',
  driver: 'Tài xế',
  admin: 'Quản trị viên',
};
const PRIORITY_ORDER: Record<ChatConversation['priority'], number> = {
  high: 0,
  normal: 1,
  low: 2,
};

const sortConversations = (items: ChatConversation[]) =>
  [...items].sort((a, b) => {
    if (a.status !== b.status) {
      return a.status === 'unresolved' ? -1 : 1;
    }
    const priorityDiff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    if (priorityDiff !== 0) {
      return priorityDiff;
    }
    return new Date(b.thread.lastMessageAt).getTime() - new Date(a.thread.lastMessageAt).getTime();
  });

const getStatusStyles = (status: ChatConversation['status']) =>
  status === 'unresolved'
    ? 'bg-rose-100 text-rose-600 ring-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300'
    : 'bg-emerald-100 text-emerald-600 ring-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300';

const initialConversations: ChatConversation[] = [
  {
    user: {
      id: 'user-001',
      email: 'linh.nguyen@example.com',
      name: 'Nguyễn Thuỳ Linh',
      role: 'student',
      isVerified: true,
      studentId: 'SV2020123',
      phoneNumber: '0901 234 567',
      emergencyContact: {
        name: 'Nguyễn Lan',
        phone: '0912 345 678',
      },
      avatar: undefined,
      createdAt: '2024-01-10T08:00:00Z',
      lastActive: '2024-04-05T07:35:00Z',
      status: 'active',
    },
    priority: 'high',
    status: 'unresolved',
    isOnline: true,
    thread: {
      userId: 'user-001',
      lastMessageAt: '2024-04-05T07:52:00Z',
      unreadCount: 1,
      tags: ['Sinh viên'],
      messages: [
        {
          id: 'm-001',
          senderId: 'user-001',
          recipientId: ADMIN_ID,
          content: 'Chào anh, em cần hỗ trợ cập nhật ảnh thẻ sinh viên để hoàn tất xác minh.',
          timestamp: '2024-04-05T07:18:00Z',
          status: 'read',
        },
        {
          id: 'm-002',
          senderId: ADMIN_ID,
          recipientId: 'user-001',
          content: 'Chào Linh, em vui lòng chụp lại ảnh sắc nét hơn và gửi lại giúp anh nhé.',
          timestamp: '2024-04-05T07:22:00Z',
          status: 'read',
        },
        {
          id: 'm-003',
          senderId: 'user-001',
          recipientId: ADMIN_ID,
          content: 'Dạ vâng, em đã gửi file zip ở biểu mẫu xác minh rồi ạ, anh kiểm tra giúp em.',
          timestamp: '2024-04-05T07:32:00Z',
          status: 'delivered',
          attachments: [
            {
              id: 'a-001',
              name: 'the-sinh-vien.zip',
              url: '#',
              type: 'application/zip',
            },
          ],
        },
        {
          id: 'm-0031',
          senderId: ADMIN_ID,
          recipientId: 'user-001',
          content: 'Anh đã nhận được gói tài liệu rồi, cảm ơn Linh. Anh sẽ đối chiếu với bản gốc trong cơ sở dữ liệu.',
          timestamp: '2024-04-05T07:34:00Z',
          status: 'read',
        },
        {
          id: 'm-0032',
          senderId: 'user-001',
          recipientId: ADMIN_ID,
          content: 'Anh xem giúp em ảnh mặt sau nhé, em chụp lại rõ hơn rồi.',
          timestamp: '2024-04-05T07:36:00Z',
          status: 'read',
          attachments: [
            {
              id: 'a-001b',
              name: 'mat-sau-the-sv.jpg',
              url: '#',
              type: 'image/jpeg',
            },
          ],
        },
        {
          id: 'm-0033',
          senderId: ADMIN_ID,
          recipientId: 'user-001',
          content: 'Anh kiểm tra thấy mã sinh viên rõ hơn rồi, em vui lòng xác nhận lại ngày hết hạn thẻ giúp anh nhé.',
          timestamp: '2024-04-05T07:39:00Z',
          status: 'read',
        },
        {
          id: 'm-0034',
          senderId: 'user-001',
          recipientId: ADMIN_ID,
          content: 'Dạ ngày hết hạn là 31/12/2027 ạ. Có cần em bổ sung giấy xác nhận của trường không anh?',
          timestamp: '2024-04-05T07:42:00Z',
          status: 'read',
        },
        {
          id: 'm-0035',
          senderId: ADMIN_ID,
          recipientId: 'user-001',
          content: 'Chưa cần giấy xác nhận đâu em, anh sẽ kích hoạt lại bước xác minh và thông báo khi hoàn tất.',
          timestamp: '2024-04-05T07:46:00Z',
          status: 'read',
        },
        {
          id: 'm-0036',
          senderId: 'user-001',
          recipientId: ADMIN_ID,
          content: 'Em cảm ơn anh, nhờ anh báo giúp em trước 9h được không ạ, em còn phải tới thư viện.',
          timestamp: '2024-04-05T07:52:00Z',
          status: 'delivered',
        },
      ],
    },
  },
  {
    user: {
      id: 'user-002',
      email: 'thanh.tran@example.com',
      name: 'Trần Văn Thành',
      role: 'driver',
      isVerified: false,
      phoneNumber: '0976 889 223',
      emergencyContact: {
        name: 'Trần Hoài Nam',
        phone: '0906 223 889',
      },
      avatar: undefined,
      createdAt: '2024-02-18T09:00:00Z',
      lastActive: '2024-04-05T06:45:00Z',
      status: 'active',
      studentId: undefined,
    },
    priority: 'high',
    status: 'unresolved',
    isOnline: true,
    thread: {
      userId: 'user-002',
      lastMessageAt: '2024-04-05T06:55:00Z',
      unreadCount: 1,
      tags: ['Tài xế'],
      messages: [
        {
          id: 'm-004',
          senderId: 'user-002',
          recipientId: ADMIN_ID,
          content: 'Anh ơi, hồ sơ đối tác tài xế của em đang báo thiếu giấy đăng ký xe.',
          timestamp: '2024-04-05T06:28:00Z',
          status: 'read',
        },
        {
          id: 'm-005',
          senderId: ADMIN_ID,
          recipientId: 'user-002',
          content: 'Em cần bổ sung ảnh đăng ký xe mặt trước và mặt sau. Có thể gửi trực tiếp ở đây.',
          timestamp: '2024-04-05T06:30:00Z',
          status: 'read',
        },
        {
          id: 'm-006',
          senderId: 'user-002',
          recipientId: ADMIN_ID,
          content: 'Em gửi file PDF. Nếu cần em sẽ ghé văn phòng vào đầu giờ chiều.',
          timestamp: '2024-04-05T06:41:00Z',
          status: 'delivered',
          attachments: [
            {
              id: 'a-002',
              name: 'dang-ky-xe.pdf',
              url: '#',
              type: 'application/pdf',
            },
          ],
        },
        {
          id: 'm-006a',
          senderId: ADMIN_ID,
          recipientId: 'user-002',
          content: 'Anh Thành kiểm tra giúp anh xem phần mô tả xe đã cập nhật đúng chưa nhé.',
          timestamp: '2024-04-05T06:45:00Z',
          status: 'read',
        },
        {
          id: 'm-006b',
          senderId: 'user-002',
          recipientId: ADMIN_ID,
          content: 'Em đã chỉnh lại mô tả rồi, anh xem còn thiếu gì không giúp em với.',
          timestamp: '2024-04-05T06:47:00Z',
          status: 'read',
        },
        {
          id: 'm-006c',
          senderId: ADMIN_ID,
          recipientId: 'user-002',
          content: 'Ổn rồi nhé, anh đang gửi hồ sơ cho bộ phận xác minh cuối cùng, dự kiến 15 phút nữa.',
          timestamp: '2024-04-05T06:50:00Z',
          status: 'read',
        },
        {
          id: 'm-006d',
          senderId: 'user-002',
          recipientId: ADMIN_ID,
          content: 'Anh hỗ trợ nhanh giúp em nhé, em đang chuẩn bị nhận chuyến đầu ngày.',
          timestamp: '2024-04-05T06:55:00Z',
          status: 'delivered',
        },
      ],
    },
  },
  {
    user: {
      id: 'user-003',
      email: 'minh.pham@example.com',
      name: 'Phạm Hữu Minh',
      role: 'student',
      isVerified: true,
      studentId: 'SV2020042',
      phoneNumber: '0965 772 110',
      emergencyContact: {
        name: 'Phạm Thuỳ Dương',
        phone: '0908 124 778',
      },
      avatar: undefined,
      createdAt: '2023-11-05T12:00:00Z',
      lastActive: '2024-04-04T15:10:00Z',
      status: 'active',
    },
    priority: 'normal',
    status: 'resolved',
    isOnline: false,
    thread: {
      userId: 'user-003',
      lastMessageAt: '2024-04-04T14:55:00Z',
      unreadCount: 0,
      tags: ['Sinh viên'],
      messages: [
        {
          id: 'm-007',
          senderId: ADMIN_ID,
          recipientId: 'user-003',
          content: 'Chào Minh, chuyến đi của em tối qua có xảy ra sự cố gì cần hỗ trợ thêm không?',
          timestamp: '2024-04-04T14:40:00Z',
          status: 'read',
        },
        {
          id: 'm-008',
          senderId: 'user-003',
          recipientId: ADMIN_ID,
          content: 'Dạ không anh, em chỉ muốn phản hồi là tài xế rất nhiệt tình. Em đã đánh giá 5 sao rồi.',
          timestamp: '2024-04-04T14:45:00Z',
          status: 'read',
        },
        {
          id: 'm-009',
          senderId: ADMIN_ID,
          recipientId: 'user-003',
          content: 'Cảm ơn Minh, anh đã ghi nhận phản hồi. Chúc em một ngày tốt lành nhé!',
          timestamp: '2024-04-04T14:55:00Z',
          status: 'read',
        },
      ],
    },
  },
  {
    user: {
      id: 'user-004',
      email: 'baoan.le@example.com',
      name: 'Lê Bảo An',
      role: 'student',
      isVerified: false,
      studentId: 'SV2021088',
      phoneNumber: '0934 556 781',
      emergencyContact: {
        name: 'Lê Thị Hồng',
        phone: '0909 223 445',
      },
      avatar: undefined,
      createdAt: '2024-03-02T10:20:00Z',
      lastActive: '2024-04-05T05:58:00Z',
      status: 'active',
    },
    priority: 'high',
    status: 'unresolved',
    isOnline: true,
    thread: {
      userId: 'user-004',
      lastMessageAt: '2024-04-05T05:55:00Z',
      unreadCount: 1,
      tags: ['Sinh viên'],
      messages: [
        {
          id: 'm-010',
          senderId: 'user-004',
          recipientId: ADMIN_ID,
          content: 'Em cần hỗ trợ khẩn để mở lại tài khoản, em đang chuẩn bị đi thi cuối kỳ.',
          timestamp: '2024-04-05T05:55:00Z',
          status: 'delivered',
          metadata: {
            important: true,
          },
        },
      ],
    },
  },
  {
    user: {
      id: 'user-005',
      email: 'phuc.do@example.com',
      name: 'Đỗ Hoàng Phúc',
      role: 'driver',
      isVerified: true,
      phoneNumber: '0982 334 221',
      emergencyContact: {
        name: 'Đỗ Thị Mai',
        phone: '0911 223 887',
      },
      avatar: undefined,
      createdAt: '2023-12-15T09:15:00Z',
      lastActive: '2024-04-03T16:00:00Z',
      status: 'active',
    },
    priority: 'low',
    status: 'resolved',
    isOnline: false,
    thread: {
      userId: 'user-005',
      lastMessageAt: '2024-04-03T14:20:00Z',
      unreadCount: 0,
      tags: ['Tài xế'],
      messages: [
        {
          id: 'm-011',
          senderId: 'user-005',
          recipientId: ADMIN_ID,
          content: 'Tôi đã cập nhật lịch bảo dưỡng xe. Nhờ đội MSSUS xác nhận giúp.',
          timestamp: '2024-04-03T13:45:00Z',
          status: 'read',
        },
        {
          id: 'm-012',
          senderId: ADMIN_ID,
          recipientId: 'user-005',
          content: 'Anh Phúc yên tâm, hồ sơ đã được duyệt và trạng thái xe đã chuyển sang hoạt động.',
          timestamp: '2024-04-03T13:58:00Z',
          status: 'read',
        },
        {
          id: 'm-013',
          senderId: 'user-005',
          recipientId: ADMIN_ID,
          content: 'Cảm ơn đội hỗ trợ, tôi đã nhận thông báo.',
          timestamp: '2024-04-03T14:20:00Z',
          status: 'read',
        },
      ],
    },
  },
  {
    user: {
      id: 'user-006',
      email: 'chi.vu@example.com',
      name: 'Vũ Lan Chi',
      role: 'student',
      isVerified: false,
      studentId: 'SV2022145',
      phoneNumber: '0912 778 661',
      emergencyContact: {
        name: 'Vũ Ngọc Thanh',
        phone: '0903 456 998',
      },
      avatar: undefined,
      createdAt: '2024-01-22T11:00:00Z',
      lastActive: '2024-04-05T03:20:00Z',
      status: 'active',
    },
    priority: 'high',
    status: 'unresolved',
    isOnline: true,
    thread: {
      userId: 'user-006',
      lastMessageAt: '2024-04-05T03:18:00Z',
      unreadCount: 1,
      tags: ['Sinh viên'],
      messages: [
        {
          id: 'm-014',
          senderId: 'user-006',
          recipientId: ADMIN_ID,
          content: 'Em không thể đặt chuyến đi sáng mai, hệ thống báo không kết nối được.',
          timestamp: '2024-04-05T03:12:00Z',
          status: 'delivered',
        },
        {
          id: 'm-015',
          senderId: ADMIN_ID,
          recipientId: 'user-006',
          content: 'Bọn anh đang kiểm tra tuyến trường em, em đợi một chút nhé.',
          timestamp: '2024-04-05T03:18:00Z',
          status: 'sent',
        },
      ],
    },
  },
  {
    user: {
      id: 'user-007',
      email: 'gia.huy@example.com',
      name: 'Ngô Gia Huy',
      role: 'driver',
      isVerified: true,
      phoneNumber: '0978 221 003',
      emergencyContact: {
        name: 'Ngô Trung Hiếu',
        phone: '0904 888 123',
      },
      avatar: undefined,
      createdAt: '2023-10-12T07:30:00Z',
      lastActive: '2024-04-04T09:22:00Z',
      status: 'active',
    },
    priority: 'normal',
    status: 'resolved',
    isOnline: false,
    thread: {
      userId: 'user-007',
      lastMessageAt: '2024-04-04T09:10:00Z',
      unreadCount: 0,
      tags: ['Tài xế'],
      messages: [
        {
          id: 'm-016',
          senderId: 'user-007',
          recipientId: ADMIN_ID,
          content: 'Xin chào, tôi đã gửi bản nâng cấp bảo hiểm mới. Vui lòng xác nhận.',
          timestamp: '2024-04-04T08:40:00Z',
          status: 'read',
        },
        {
          id: 'm-017',
          senderId: ADMIN_ID,
          recipientId: 'user-007',
          content: 'Tài liệu đã trùng khớp, anh Huy có thể tiếp tục nhận chuyến.',
          timestamp: '2024-04-04T09:10:00Z',
          status: 'read',
        },
      ],
    },
  },
  {
    user: {
      id: 'user-008',
      email: 'tuan.phan@example.com',
      name: 'Phan Minh Tuấn',
      role: 'student',
      isVerified: true,
      studentId: 'SV2020991',
      phoneNumber: '0905 667 431',
      emergencyContact: {
        name: 'Phan Thị Thuỷ',
        phone: '0933 882 116',
      },
      avatar: undefined,
      createdAt: '2024-01-05T06:00:00Z',
      lastActive: '2024-04-05T02:45:00Z',
      status: 'active',
    },
    priority: 'high',
    status: 'unresolved',
    isOnline: true,
    thread: {
      userId: 'user-008',
      lastMessageAt: '2024-04-05T02:44:00Z',
      unreadCount: 3,
      tags: ['Sinh viên'],
      messages: [
        {
          id: 'm-018',
          senderId: 'user-008',
          recipientId: ADMIN_ID,
          content: 'Ví của em bị trừ gấp đôi sau chuyến đi tối qua, anh hỗ trợ hoàn lại với.',
          timestamp: '2024-04-05T02:32:00Z',
          status: 'delivered',
        },
        {
          id: 'm-019',
          senderId: ADMIN_ID,
          recipientId: 'user-008',
          content: 'Anh đã ghi nhận, sẽ kiểm tra lịch sử thanh toán.',
          timestamp: '2024-04-05T02:38:00Z',
          status: 'sent',
        },
        {
          id: 'm-020',
          senderId: 'user-008',
          recipientId: ADMIN_ID,
          content: 'Nhờ anh xử lý gấp giúp em, em cần tiền ăn sáng.',
          timestamp: '2024-04-05T02:44:00Z',
          status: 'delivered',
        },
      ],
    },
  },
  {
    user: {
      id: 'user-009',
      email: 'yen.nhi@example.com',
      name: 'Hoàng Yến Nhi',
      role: 'student',
      isVerified: true,
      studentId: 'SV2020777',
      phoneNumber: '0938 445 210',
      emergencyContact: {
        name: 'Hoàng Phương Linh',
        phone: '0903 344 556',
      },
      avatar: undefined,
      createdAt: '2023-09-18T10:00:00Z',
      lastActive: '2024-04-04T12:20:00Z',
      status: 'active',
    },
    priority: 'normal',
    status: 'resolved',
    isOnline: false,
    thread: {
      userId: 'user-009',
      lastMessageAt: '2024-04-04T11:48:00Z',
      unreadCount: 0,
      tags: ['Sinh viên'],
      messages: [
        {
          id: 'm-021',
          senderId: 'user-009',
          recipientId: ADMIN_ID,
          content: 'Anh ơi, em muốn cập nhật số điện thoại liên hệ khẩn cấp.',
          timestamp: '2024-04-04T11:32:00Z',
          status: 'read',
        },
        {
          id: 'm-022',
          senderId: ADMIN_ID,
          recipientId: 'user-009',
          content: 'Đã cập nhật giúp em rồi nhé, nhớ kiểm tra lại trong hồ sơ cá nhân.',
          timestamp: '2024-04-04T11:48:00Z',
          status: 'read',
        },
      ],
    },
  },
  {
    user: {
      id: 'user-010',
      email: 'thinh.trinh@example.com',
      name: 'Trịnh Đức Thịnh',
      role: 'driver',
      isVerified: false,
      phoneNumber: '0911 234 765',
      emergencyContact: {
        name: 'Trịnh Đức Hòa',
        phone: '0901 889 543',
      },
      avatar: undefined,
      createdAt: '2024-02-10T13:15:00Z',
      lastActive: '2024-04-05T01:40:00Z',
      status: 'active',
    },
    priority: 'high',
    status: 'unresolved',
    isOnline: true,
    thread: {
      userId: 'user-010',
      lastMessageAt: '2024-04-05T01:38:00Z',
      unreadCount: 2,
      tags: ['Tài xế'],
      messages: [
        {
          id: 'm-023',
          senderId: 'user-010',
          recipientId: ADMIN_ID,
          content: 'Tôi bị chặn nhận chuyến vì hồ sơ thiếu kiểm tra lý lịch.',
          timestamp: '2024-04-05T01:24:00Z',
          status: 'delivered',
        },
        {
          id: 'm-024',
          senderId: ADMIN_ID,
          recipientId: 'user-010',
          content: 'Anh vui lòng gửi bản sao căn cước qua đây để đội compliance xác minh.',
          timestamp: '2024-04-05T01:31:00Z',
          status: 'sent',
        },
        {
          id: 'm-025',
          senderId: 'user-010',
          recipientId: ADMIN_ID,
          content: 'Tôi đã gửi rồi, nhờ anh đẩy giúp để tôi chạy ca sáng.',
          timestamp: '2024-04-05T01:38:00Z',
          status: 'delivered',
        },
      ],
    },
  },
  {
    user: {
      id: 'user-011',
      email: 'quynhanh.bui@example.com',
      name: 'Bùi Quỳnh Anh',
      role: 'student',
      isVerified: true,
      studentId: 'SV2020543',
      phoneNumber: '0902 889 144',
      emergencyContact: {
        name: 'Bùi Thế Nam',
        phone: '0912 889 144',
      },
      avatar: undefined,
      createdAt: '2023-08-11T09:40:00Z',
      lastActive: '2024-04-04T08:05:00Z',
      status: 'active',
    },
    priority: 'normal',
    status: 'resolved',
    isOnline: false,
    thread: {
      userId: 'user-011',
      lastMessageAt: '2024-04-04T07:55:00Z',
      unreadCount: 0,
      tags: ['Sinh viên'],
      messages: [
        {
          id: 'm-026',
          senderId: 'user-011',
          recipientId: ADMIN_ID,
          content: 'Em cần xem lại hóa đơn chuyến đi hôm qua.',
          timestamp: '2024-04-04T07:40:00Z',
          status: 'read',
        },
        {
          id: 'm-027',
          senderId: ADMIN_ID,
          recipientId: 'user-011',
          content: 'Anh đã gửi bản sao hoá đơn qua email MSSUS cho em rồi nhé.',
          timestamp: '2024-04-04T07:55:00Z',
          status: 'read',
        },
      ],
    },
  },
  {
    user: {
      id: 'user-012',
      email: 'nhatnam.dang@example.com',
      name: 'Đặng Nhật Nam',
      role: 'driver',
      isVerified: false,
      phoneNumber: '0903 776 552',
      emergencyContact: {
        name: 'Đặng Thị Lam',
        phone: '0934 776 552',
      },
      avatar: undefined,
      createdAt: '2024-03-12T08:10:00Z',
      lastActive: '2024-04-05T00:55:00Z',
      status: 'active',
    },
    priority: 'high',
    status: 'unresolved',
    isOnline: true,
    thread: {
      userId: 'user-012',
      lastMessageAt: '2024-04-05T00:52:00Z',
      unreadCount: 2,
      tags: ['Tài xế'],
      messages: [
        {
          id: 'm-028',
          senderId: 'user-012',
          recipientId: ADMIN_ID,
          content: 'Ứng dụng báo lỗi định vị nên tôi không thể kết thúc chuyến đi.',
          timestamp: '2024-04-05T00:46:00Z',
          status: 'delivered',
        },
        {
          id: 'm-029',
          senderId: ADMIN_ID,
          recipientId: 'user-012',
          content: 'Anh giữ nguyên hành trình, bọn em đang làm việc với đội kỹ thuật.',
          timestamp: '2024-04-05T00:50:00Z',
          status: 'sent',
        },
        {
          id: 'm-030',
          senderId: 'user-012',
          recipientId: ADMIN_ID,
          content: 'Tôi cần xác nhận sớm để tránh ảnh hưởng điểm số.',
          timestamp: '2024-04-05T00:52:00Z',
          status: 'delivered',
        },
      ],
    },
  },
  {
    user: {
      id: 'user-013',
      email: 'thuyvy.ta@example.com',
      name: 'Tạ Thuý Vy',
      role: 'student',
      isVerified: true,
      studentId: 'SV2020315',
      phoneNumber: '0917 665 432',
      emergencyContact: {
        name: 'Tạ Minh Triết',
        phone: '0902 665 432',
      },
      avatar: undefined,
      createdAt: '2023-07-22T08:25:00Z',
      lastActive: '2024-04-03T21:10:00Z',
      status: 'active',
    },
    priority: 'normal',
    status: 'resolved',
    isOnline: false,
    thread: {
      userId: 'user-013',
      lastMessageAt: '2024-04-03T20:55:00Z',
      unreadCount: 0,
      tags: ['Sinh viên'],
      messages: [
        {
          id: 'm-031',
          senderId: 'user-013',
          recipientId: ADMIN_ID,
          content: 'Anh có thể giải thích vì sao chuyến đi bị huỷ phí 5.000đ không?',
          timestamp: '2024-04-03T20:40:00Z',
          status: 'read',
        },
        {
          id: 'm-032',
          senderId: ADMIN_ID,
          recipientId: 'user-013',
          content: 'Đó là phí hủy muộn theo chính sách MSSUS, anh đã ghi chú giải thích trong lịch sử chuyến.',
          timestamp: '2024-04-03T20:55:00Z',
          status: 'read',
        },
      ],
    },
  },
];

const sortedInitialConversations = sortConversations(initialConversations);

// Use centralized date utilities with proper Vietnam timezone handling
const formatRelativeTime = (iso: string) => formatRelativeTimeUtil(iso, '');
const formatDateLabel = (iso: string) => formatDateLabelUtil(iso, '');
const formatTime = (iso: string) => formatTimeUtil(iso, { hour: '2-digit', minute: '2-digit', second: undefined }, '');

const UserChat: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [conversations, setConversations] = useState<ChatConversation[]>(sortedInitialConversations);
  const [activeUserId, setActiveUserId] = useState<string | null>(sortedInitialConversations[0]?.user.id ?? null);

  const filteredConversations = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) {
      return conversations;
    }
    return conversations.filter((conversation) => {
      const { user } = conversation;
      return (
        user.name.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword) ||
        user.phoneNumber.toLowerCase().includes(keyword)
      );
    });
  }, [conversations, searchTerm]);

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.user.id === activeUserId) ?? null,
    [conversations, activeUserId]
  );

  const groupedMessages = useMemo(() => {
    if (!activeConversation) {
      return [];
    }
    const sorted = [...activeConversation.thread.messages].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    const groups: Array<{ key: string; label: string; messages: ChatMessage[] }> = [];
    sorted.forEach((message) => {
      const groupKey = new Date(message.timestamp).toDateString();
      let group = groups.find((item) => item.key === groupKey);
      if (!group) {
        group = {
          key: groupKey,
          label: formatDateLabel(message.timestamp),
          messages: [],
        };
        groups.push(group);
      }
      group.messages.push(message);
    });
    return groups;
  }, [activeConversation]);

  const handleSelectConversation = (userId: string) => {
    setActiveUserId(userId);
    setConversations((prev) =>
      sortConversations(
        prev.map((conversation) =>
          conversation.user.id === userId
            ? {
                ...conversation,
                thread: {
                  ...conversation.thread,
                  unreadCount: 0,
                },
              }
            : conversation
        )
      )
    );
  };

  const handleSendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!messageInput.trim() || !activeConversation) {
      return;
    }

    const newMessage: ChatMessage = {
      id: `m-${Date.now()}`,
      senderId: ADMIN_ID,
      recipientId: activeConversation.user.id,
      content: messageInput.trim(),
      timestamp: new Date().toISOString(),
      status: 'sent',
    };

    setConversations((prev) =>
      sortConversations(
        prev.map((conversation) =>
          conversation.user.id === activeConversation.user.id
            ? {
                ...conversation,
                thread: {
                  ...conversation.thread,
                  messages: [...conversation.thread.messages, newMessage],
                  lastMessageAt: newMessage.timestamp,
                },
              }
            : conversation
        )
      )
    );
    setMessageInput('');
  };

  return (
    <div className="flex h-full min-h-0 flex-col space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">
          Trung tâm trò chuyện
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Quản lý hội thoại với người dùng trong thời gian thực, phân loại theo trạng thái giải quyết và ưu tiên hỗ trợ khẩn.
        </p>
      </div>

      <div
        className="grid flex-1 gap-6 xl:grid-cols-[360px_minmax(0,1fr)]"
        style={{ height: 'calc(100vh - 220px)', minHeight: '520px' }}
      >
        <aside className="flex h-full min-h-0 flex-col">
          <div className="flex h-full flex-col rounded-3xl border border-white/60 bg-white/80 p-4 shadow-xl shadow-slate-200/70 backdrop-blur dark:border-slate-800/60 dark:bg-slate-900/80 dark:shadow-black/30">
            <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50/70 px-3 py-2 ring-1 ring-slate-900/5 dark:bg-slate-800/70 dark:ring-white/10">
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Tìm kiếm theo tên, email hoặc SĐT..."
                className="w-full bg-transparent text-sm text-slate-600 placeholder:text-slate-400 focus:outline-none dark:text-slate-200 dark:placeholder:text-slate-500"
              />
              <EllipsisVerticalIcon className="h-5 w-5 text-slate-400" />
            </div>
            <div className="mt-4 flex-1 overflow-hidden">
              <div className="space-y-2 overflow-y-auto pr-1">
                {filteredConversations.length === 0 && (
                  <div className="rounded-2xl bg-slate-50/60 px-4 py-6 text-center text-sm text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                    Không tìm thấy hội thoại phù hợp.
                  </div>
                )}
                {filteredConversations.map((conversation) => {
                  const { user, thread, isOnline, status } = conversation;
                  const isActive = user.id === activeUserId;
                  return (
                    <button
                      key={user.id}
                      onClick={() => handleSelectConversation(user.id)}
                      className={cn(
                        'w-full rounded-2xl px-4 py-3 text-left transition-all duration-200',
                        'border border-transparent hover:-translate-y-0.5 hover:shadow-lg',
                        'bg-white/70 hover:bg-white shadow-sm ring-1 ring-slate-900/5 backdrop-blur-sm',
                        'dark:bg-slate-900/80 dark:text-slate-100 dark:ring-white/5 dark:hover:bg-slate-900',
                        isActive &&
                          'border-indigo-200 bg-gradient-to-r from-indigo-500/10 via-indigo-500/5 to-purple-500/10 shadow-indigo-500/20 dark:border-indigo-500/40'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/30">
                          <span className="text-lg font-semibold">{user.name.charAt(0)}</span>
                          <span
                            className={cn(
                              'absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white dark:border-slate-900',
                              isOnline ? 'bg-emerald-400' : 'bg-slate-400'
                            )}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                              {user.name}
                            </p>
                            <span className="text-xs text-slate-400">{formatRelativeTime(thread.lastMessageAt)}</span>
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-wide">
                            <span className={cn('rounded-full px-2 py-0.5 ring-1', getStatusStyles(status))}>
                              {status === 'unresolved' ? 'Chưa giải quyết' : 'Đã giải quyết'}
                            </span>
                            {thread.tags?.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full bg-indigo-50 px-2 py-0.5 text-indigo-500 ring-1 ring-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                          <p className="mt-2 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                            {thread.messages[thread.messages.length - 1]?.content}
                          </p>
                        </div>
                        {thread.unreadCount > 0 && (
                          <span className="flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-xs font-semibold text-white shadow-lg shadow-rose-500/30">
                            {thread.unreadCount}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>

        <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-3xl border border-white/60 bg-white/90 shadow-xl shadow-slate-200/70 backdrop-blur dark:border-slate-800/50 dark:bg-slate-900/80 dark:shadow-black/40">
          {!activeConversation ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 p-12 text-center text-slate-500 dark:text-slate-400">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
                <ChatBubbleLeftRightIcon className="h-8 w-8" />
              </div>
              <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
                Chọn một hội thoại để bắt đầu
              </h2>
              <p className="max-w-sm text-sm">
                Danh sách bên trái hiển thị những người dùng cần hỗ trợ. Bạn có thể gắn nhãn, đánh dấu ưu tiên và ghi chú trực tiếp.
              </p>
            </div>
          ) : (
            <>
              <header className="flex items-center justify-between border-b border-white/60 px-8 py-6 backdrop-blur dark:border-slate-800/60">
                <div className="flex items-center gap-4">
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/30">
                    <span className="text-xl font-semibold">{activeConversation.user.name.charAt(0)}</span>
                    <span
                      className={cn(
                        'absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white dark:border-slate-900',
                        activeConversation.isOnline ? 'bg-emerald-400' : 'bg-slate-400'
                      )}
                    />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                      {activeConversation.user.name}
                    </h2>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide">
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 ring-1',
                          getStatusStyles(activeConversation.status)
                        )}
                      >
                        {activeConversation.status === 'unresolved' ? 'Chưa giải quyết' : 'Đã giải quyết'}
                      </span>
                      {activeConversation.thread.tags?.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-indigo-50 px-2 py-0.5 text-indigo-500 ring-1 ring-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span>{activeConversation.user.email}</span>
                      <span className="hidden sm:inline-block">•</span>
                      <span>Trạng thái: {activeConversation.user.status === 'active' ? 'Đang hoạt động' : 'Tạm ngưng'}</span>
                      <span className="hidden sm:inline-block">•</span>
                      <span>Vai trò: {ROLE_LABELS[activeConversation.user.role]}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    disabled={activeConversation.status === 'resolved'}
                    className={cn(
                      'rounded-xl px-4 py-2 text-sm font-semibold transition-all',
                      activeConversation.status === 'resolved'
                        ? 'bg-emerald-100 text-emerald-600 ring-1 ring-emerald-500/20 shadow-sm dark:bg-emerald-500/10 dark:text-emerald-300 cursor-default'
                        : 'bg-gradient-to-r from-emerald-500 via-green-500 to-lime-500 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50'
                    )}
                  >
                    {activeConversation.status === 'resolved' ? 'Đã xử lý' : 'Đánh dấu đã xử lý'}
                  </button>
                </div>
              </header>

              <div className="flex min-h-0 flex-1 flex-col">
                <div className="flex-1 space-y-8 overflow-y-auto px-8 py-6">
                  {groupedMessages.map((group) => (
                    <div key={group.key} className="space-y-4">
                      <div className="flex items-center justify-center">
                        <span className="rounded-full bg-slate-100 px-4 py-1 text-xs font-medium text-slate-500 shadow-sm dark:bg-slate-800/70 dark:text-slate-300">
                          {group.label}
                        </span>
                      </div>
                      <div className="space-y-4">
                        {group.messages.map((message) => {
                          const isAdmin = message.senderId === ADMIN_ID;
                          return (
                            <div key={message.id} className={cn('flex w-full', isAdmin ? 'justify-end' : 'justify-start')}>
                              <div
                                className={cn(
                                  'max-w-lg rounded-3xl px-5 py-3 text-sm shadow-lg',
                                  isAdmin
                                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-indigo-500/30'
                                    : 'bg-white/80 text-slate-700 ring-1 ring-slate-900/5 dark:bg-slate-800/80 dark:text-slate-200 dark:ring-white/10'
                                )}
                              >
                                <p className="whitespace-pre-line leading-relaxed">{message.content}</p>
                                {message.attachments && message.attachments.length > 0 && (
                                  <div className="mt-3 space-y-2">
                                    {message.attachments.map((attachment) => (
                                      <div
                                        key={attachment.id}
                                        className="flex items-center gap-2 rounded-2xl bg-white/90 px-3 py-2 text-xs text-slate-600 shadow-sm ring-1 ring-slate-900/5 backdrop-blur-md dark:bg-slate-900/80 dark:text-slate-300 dark:ring-white/10"
                                      >
                                        <span className="font-medium text-indigo-500 dark:text-indigo-300">
                                          {attachment.name}
                                        </span>
                                        <span>•</span>
                                        <span>{attachment.type.replace('application/', '').toUpperCase()}</span>
                                        <a href={attachment.url} className="font-semibold text-indigo-500 hover:underline">
                                          Xem
                                        </a>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                <div
                                  className={cn(
                                    'mt-2 flex items-center gap-2 text-xs',
                                    isAdmin ? 'text-indigo-100/80' : 'text-slate-400'
                                  )}
                                >
                                  <span>{formatTime(message.timestamp)}</span>
                                  <span>•</span>
                                  <span>
                                    {message.status === 'sent'
                                      ? 'Đã gửi'
                                      : message.status === 'delivered'
                                      ? 'Đã đến'
                                      : 'Đã xem'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <form
                  onSubmit={handleSendMessage}
                  className="border-t border-white/60 bg-white/80 px-8 py-6 backdrop-blur dark:border-slate-800/60 dark:bg-slate-900/80"
                >
                  <div className="flex items-end gap-4 rounded-3xl bg-slate-50/80 p-4 shadow-inner ring-1 ring-slate-900/5 transition-all focus-within:ring-indigo-200 dark:bg-slate-800/70 dark:ring-white/10 dark:focus-within:ring-indigo-500/30">
                    <button
                      type="button"
                      className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/90 text-slate-500 shadow-sm ring-1 ring-slate-900/5 transition hover:text-indigo-500 dark:bg-slate-900/70 dark:text-slate-300 dark:ring-white/10 dark:hover:text-indigo-400"
                      title="Chèn biểu tượng cảm xúc"
                    >
                      <FaceSmileIcon className="h-5 w-5" />
                    </button>
                    <textarea
                      value={messageInput}
                      onChange={(event) => setMessageInput(event.target.value)}
                      rows={2}
                      placeholder="Nhập nội dung phản hồi cho người dùng..."
                      className="flex-1 resize-none bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
                    />
                    <button
                      type="submit"
                      className={cn(
                        'inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition-all',
                        messageInput.trim()
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50'
                          : 'bg-slate-200 text-slate-500 cursor-not-allowed dark:bg-slate-700 dark:text-slate-400'
                      )}
                      disabled={!messageInput.trim()}
                    >
                      Gửi phản hồi
                      <PaperAirplaneIcon className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default UserChat;
