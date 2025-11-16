import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PhoneIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  StarIcon,
  UserIcon,
  XMarkIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import {
  getEmergencyContacts,
  createEmergencyContact,
  updateEmergencyContact,
  deleteEmergencyContact,
  setContactAsPrimary,
} from '../services/sosService';
import { EmergencyContact, EmergencyContactRequest } from '../types';

export default function EmergencyContacts() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [formData, setFormData] = useState<EmergencyContactRequest>({
    name: '',
    phone: '',
    relationship: '',
    isPrimary: false,
  });

  const loadContacts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getEmergencyContacts();
      setContacts(data);
    } catch (error: any) {
      console.error('Failed to load emergency contacts:', error);
      toast.error(error?.message || 'Không thể tải danh sách liên hệ khẩn cấp');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  const handleOpenModal = (contact?: EmergencyContact) => {
    if (contact) {
      setEditingContact(contact);
      setFormData({
        name: contact.name,
        phone: contact.phone,
        relationship: contact.relationship || '',
        isPrimary: contact.isPrimary,
      });
    } else {
      setEditingContact(null);
      setFormData({
        name: '',
        phone: '',
        relationship: '',
        isPrimary: contacts.length === 0, // Auto-set primary if first contact
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingContact(null);
    setFormData({
      name: '',
      phone: '',
      relationship: '',
      isPrimary: false,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên liên hệ');
      return;
    }

    if (!formData.phone.trim()) {
      toast.error('Vui lòng nhập số điện thoại');
      return;
    }

    // Validate phone format (basic validation)
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
    if (!phoneRegex.test(formData.phone)) {
      toast.error('Số điện thoại không hợp lệ');
      return;
    }

    try {
      if (editingContact) {
        await updateEmergencyContact(editingContact.id, formData);
        toast.success('Đã cập nhật liên hệ khẩn cấp');
      } else {
        await createEmergencyContact(formData);
        toast.success('Đã thêm liên hệ khẩn cấp');
      }
      handleCloseModal();
      loadContacts();
    } catch (error: any) {
      console.error('Failed to save contact:', error);
      toast.error(error?.message || 'Không thể lưu liên hệ khẩn cấp');
    }
  };

  const handleDelete = async (contactId: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa liên hệ này?')) {
      return;
    }

    try {
      await deleteEmergencyContact(contactId);
      toast.success('Đã xóa liên hệ khẩn cấp');
      loadContacts();
    } catch (error: any) {
      console.error('Failed to delete contact:', error);
      toast.error(error?.message || 'Không thể xóa liên hệ khẩn cấp');
    }
  };

  const handleSetPrimary = async (contactId: number) => {
    try {
      await setContactAsPrimary(contactId);
      toast.success('Đã đặt làm liên hệ chính');
      loadContacts();
    } catch (error: any) {
      console.error('Failed to set primary contact:', error);
      toast.error(error?.message || 'Không thể đặt làm liên hệ chính');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Liên hệ khẩn cấp
              </h1>
              <p className="text-gray-600">
                Quản lý danh sách người liên hệ khi cần giúp đỡ khẩn cấp
              </p>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Thêm liên hệ</span>
            </button>
          </div>

          {contacts.length === 0 && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800">
                ⚠️ Bạn chưa có liên hệ khẩn cấp nào. Vui lòng thêm ít nhất một liên hệ để sử dụng tính năng SOS.
              </p>
            </div>
          )}
        </div>

        {/* Contacts List */}
        <div className="space-y-4">
          <AnimatePresence>
            {contacts.map((contact) => (
              <motion.div
                key={contact.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
                      {contact.name.charAt(0).toUpperCase()}
                    </div>

                    {/* Contact Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {contact.name}
                        </h3>
                        {contact.isPrimary && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                            <StarSolidIcon className="h-3 w-3" />
                            Chính
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <PhoneIcon className="h-4 w-4" />
                        <span>{contact.phone}</span>
                      </div>

                      {contact.relationship && (
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                          <UserIcon className="h-4 w-4" />
                          <span>{contact.relationship}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {!contact.isPrimary && (
                      <button
                        onClick={() => handleSetPrimary(contact.id)}
                        className="p-2 text-gray-400 hover:text-yellow-500 transition-colors"
                        title="Đặt làm liên hệ chính"
                      >
                        <StarIcon className="h-5 w-5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleOpenModal(contact)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Chỉnh sửa"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(contact.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Xóa"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={handleCloseModal}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingContact ? 'Chỉnh sửa liên hệ' : 'Thêm liên hệ mới'}
                  </h2>
                  <button
                    onClick={handleCloseModal}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên liên hệ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nguyễn Văn A"
                      required
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+84901234567"
                      required
                    />
                  </div>

                  {/* Relationship */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mối quan hệ
                    </label>
                    <input
                      type="text"
                      value={formData.relationship}
                      onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ví dụ: Bố, Mẹ, Anh, Chị, Bạn bè..."
                    />
                  </div>

                  {/* Primary checkbox */}
                  {!editingContact && contacts.length > 0 && (
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isPrimary"
                        checked={formData.isPrimary}
                        onChange={(e) => setFormData({ ...formData, isPrimary: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <label htmlFor="isPrimary" className="text-sm text-gray-700">
                        Đặt làm liên hệ chính
                      </label>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckIcon className="h-5 w-5" />
                      <span>{editingContact ? 'Cập nhật' : 'Thêm'}</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
