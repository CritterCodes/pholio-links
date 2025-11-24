'use client';

import { BioBlock } from '../blocks/BioBlock';
import { LinksBlock } from '../blocks/LinksBlock';
import { SocialIconsBlock } from '../blocks/SocialIconsBlock';
import { GalleryBlock } from '../blocks/GalleryBlock';
import { DividerBlock } from '../blocks/DividerBlock';
import { ContactBlock } from '../blocks/ContactBlock';
// import { SubtitleBlock } from '../blocks/SubtitleBlock'; // Moved to Basic Details section

interface Block {
  _id: string;
  type: string;
  content: Record<string, unknown>;
  order: number;
  enabled: boolean;
}

interface BlockRendererProps {
  block: Block;
  onUpdate: (blockId: string, content: Record<string, unknown>) => void;
  onRemove: (blockId: string) => void;
  onToggleVisibility: (blockId: string) => void;
}

export function BlockRenderer({ block, onUpdate, onRemove, onToggleVisibility }: BlockRendererProps) {
  switch (block.type) {
    case 'bio':
      return (
        <BioBlock
          block={block}
          onUpdate={onUpdate}
          onRemove={onRemove}
          onToggleVisibility={onToggleVisibility}
        />
      );
    
    // Subtitle moved to Basic Details section
    // case 'subtitle':
    //   return (
    //     <SubtitleBlock
    //       block={block}
    //       onUpdate={onUpdate}
    //       onRemove={onRemove}
    //       onToggleVisibility={onToggleVisibility}
    //     />
    //   );
    
    case 'links':
      return (
        <LinksBlock
          block={block}
          onUpdate={onUpdate}
          onRemove={onRemove}
          onToggleVisibility={onToggleVisibility}
        />
      );
    
    case 'social_icons':
      return (
        <SocialIconsBlock
          block={block}
          onUpdate={onUpdate}
          onRemove={onRemove}
          onToggleVisibility={onToggleVisibility}
        />
      );
    
    case 'gallery':
      return (
        <GalleryBlock
          block={block}
          onUpdate={onUpdate}
          onRemove={onRemove}
          onToggleVisibility={onToggleVisibility}
        />
      );
    
    case 'divider':
      return (
        <DividerBlock
          block={block}
          onUpdate={onUpdate}
          onRemove={onRemove}
          onToggleVisibility={onToggleVisibility}
        />
      );
    
    case 'contact':
      return (
        <ContactBlock
          block={block}
          onUpdate={onUpdate}
          onRemove={onRemove}
          onToggleVisibility={onToggleVisibility}
        />
      );
    
    // Add more block types here as needed
    default:
      return (
        <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
          <div className="text-sm text-gray-500">
            Block type &quot;{block.type}&quot; not implemented yet
          </div>
        </div>
      );
  }
}