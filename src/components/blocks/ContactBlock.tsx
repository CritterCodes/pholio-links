'use client';

import { useState } from 'react';
import { GripVertical, X, Eye, EyeOff, Phone, Mail, MapPin, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

interface Block {
  _id: string;
  type: string;
  content: Record<string, unknown>;
  order: number;
  enabled: boolean;
}

interface ContactItem {
  id: string;
  type: 'phone' | 'email' | 'address';
  label: string;
  value: string;
  enabled: boolean;
}

interface ContactBlockProps {
  block: Block;
  onUpdate: (blockId: string, content: Record<string, unknown>) => void;
  onRemove: (blockId: string) => void;
  onToggleVisibility: (blockId: string) => void;
}

const contactTypes = [
  { key: 'phone', name: 'Phone', icon: Phone, placeholder: '+1 (555) 123-4567' },
  { key: 'email', name: 'Email', icon: Mail, placeholder: 'your@email.com' },
  { key: 'address', name: 'Address', icon: MapPin, placeholder: 'City, State/Country' },
];

export function ContactBlock({ block, onUpdate, onRemove, onToggleVisibility }: ContactBlockProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const title = (block.content as { title?: string })?.title || 'Contact Me';
  const contacts = (block.content as { contacts?: ContactItem[] })?.contacts || [];

  const handleTitleChange = (newTitle: string) => {
    onUpdate(block._id, { ...block.content, title: newTitle });
  };

  const addContact = (type: 'phone' | 'email' | 'address') => {
    const existingContactsOfType = contacts.filter(c => c.type === type);
    const nextIndex = existingContactsOfType.length + 1;
    const newContact: ContactItem = {
      id: `contact-${type}-${nextIndex}`,
      type,
      label: contactTypes.find(ct => ct.key === type)?.name || '',
      value: '',
      enabled: true
    };
    onUpdate(block._id, { ...block.content, contacts: [...contacts, newContact] });
  };

  const updateContact = (contactId: string, field: keyof ContactItem, value: string | boolean) => {
    const updatedContacts = contacts.map(contact =>
      contact.id === contactId ? { ...contact, [field]: value } : contact
    );
    onUpdate(block._id, { ...block.content, contacts: updatedContacts });
  };

  const removeContact = (contactId: string) => {
    const updatedContacts = contacts.filter(contact => contact.id !== contactId);
    onUpdate(block._id, { ...block.content, contacts: updatedContacts });
  };

  const getContactIcon = (type: string) => {
    const contactType = contactTypes.find(ct => ct.key === type);
    return contactType ? contactType.icon : Phone;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="cursor-grab active:cursor-grabbing">
            <GripVertical className="w-5 h-5 text-gray-400" />
          </div>
          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
            <Phone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100">Contact Information</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Share your contact details</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            title={isCollapsed ? 'Expand' : 'Collapse'}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
          <button
            onClick={() => onToggleVisibility(block._id)}
            className={`p-2 rounded-lg transition-colors ${
              block.enabled
                ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-800'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {block.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
          <button
            onClick={() => onRemove(block._id)}
            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isCollapsed && block.enabled && (
        <div className="space-y-4">
          {/* Block Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Section Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Contact Me"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Contact Items */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Contact Details
              </label>
              <div className="flex gap-1">
                {contactTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.key}
                      onClick={() => addContact(type.key as 'phone' | 'email' | 'address')}
                      className="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                      title={`Add ${type.name}`}
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              {contacts.map((contact) => {
                const ContactIcon = getContactIcon(contact.type);
                const contactType = contactTypes.find(ct => ct.key === contact.type);
                
                return (
                  <div key={contact.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                    <div className="flex items-center gap-3 mb-3">
                      <ContactIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      <input
                        type="text"
                        value={contact.label}
                        onChange={(e) => updateContact(contact.id, 'label', e.target.value)}
                        placeholder={contactType?.name || 'Label'}
                        className="flex-1 px-2 py-1 text-sm border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                      <button
                        onClick={() => updateContact(contact.id, 'enabled', !contact.enabled)}
                        className={`p-1 rounded text-xs ${
                          contact.enabled
                            ? 'text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900'
                            : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {contact.enabled ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      </button>
                      <button
                        onClick={() => removeContact(contact.id)}
                        className="p-1 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 rounded text-xs"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <input
                      type={contact.type === 'email' ? 'email' : contact.type === 'phone' ? 'tel' : 'text'}
                      value={contact.value}
                      onChange={(e) => updateContact(contact.id, 'value', e.target.value)}
                      placeholder={contactType?.placeholder || 'Enter value'}
                      className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                );
              })}

              {contacts.length === 0 && (
                <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                  <Phone className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No contact details added yet</p>
                  <p className="text-xs">Click the icons above to add contact information</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}