import React, { useMemo, useState } from 'react';
import { Download, Pin, Plus, Search, Trash2, Edit3 } from 'lucide-react';
import { useRebirth } from '../context/RebirthContext';
import { VAULT_CATEGORIES, type VaultCategory, type VaultNote } from '../types/rebirth';
import { todayIsoDate } from '../lib/firebase';

export const VaultView: React.FC = () => {
  const { vaultNotes, addVaultNote, updateVaultNote, deleteVaultNote } = useRebirth();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingNote, setEditingNote] = useState<VaultNote | null>(null);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<VaultCategory>('My thoughts');
  const [tagsRaw, setTagsRaw] = useState('');
  const [content, setContent] = useState('');

  const filteredNotes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return vaultNotes
      .filter((n) => {
        if (selectedCategory !== 'All' && n.category !== selectedCategory) return false;
        if (!q) return true;
        return (
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          n.tags.some((t) => t.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => Number(b.pinned) - Number(a.pinned));
  }, [vaultNotes, selectedCategory, searchQuery]);

  const startEdit = (note: VaultNote) => {
    setEditingNote(note);
    setTitle(note.title);
    setCategory(note.category);
    setTagsRaw(note.tags.join(', '));
    setContent(note.content);
  };

  const resetForm = () => {
    setEditingNote(null);
    setTitle('');
    setCategory('My thoughts');
    setTagsRaw('');
    setContent('');
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const tags = tagsRaw
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 10);

    if (editingNote) {
      await updateVaultNote(editingNote.id, {
        title: title.trim(),
        category,
        tags,
        content,
      });
    } else {
      await addVaultNote({
        title: title.trim(),
        category,
        tags,
        content,
        pinned: false,
      });
    }
    resetForm();
  };

  const handleExportMarkdown = () => {
    const md = vaultNotes
      .map(
        (n) =>
          `# ${n.title}\nCategory: ${n.category} | Tags: ${n.tags.join(', ') || 'None'}\n\n${n.content}\n\n---\n`
      )
      .join('\n');
    const blob = new Blob([md || 'No notes recorded yet.'], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `project-rebirth-vault-${todayIsoDate()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <p className="text-xs font-mono uppercase tracking-[0.18em] text-[#9A7420] dark:text-[#C8A24A]">
            Private Digital Notebook
          </p>
          <h1 className="text-3xl font-display font-semibold text-zinc-900 dark:text-white mt-1">
            Journal &amp; Knowledge Vault
          </h1>
        </div>
        <button
          type="button"
          onClick={handleExportMarkdown}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:border-[#C8A24A] cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          Export Vault (.md)
        </button>
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes, ideas, scripture lessons, or tags..."
            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-[#111114] pl-9 pr-3 py-2 text-sm text-zinc-900 dark:text-zinc-100"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {['All', ...VAULT_CATEGORIES].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#C8A24A] text-zinc-950 font-semibold'
                  : 'bg-zinc-200/70 dark:bg-[#18181C] text-zinc-700 dark:text-zinc-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        <form
          onSubmit={(e) => void handleSaveNote(e)}
          className="lg:col-span-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111114] p-6 space-y-4 h-fit"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display font-semibold text-zinc-900 dark:text-white">
              {editingNote ? 'Edit Vault Note' : 'New Vault Entry'}
            </h2>
            {editingNote && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
              >
                Cancel Edit
              </button>
            )}
          </div>
          <input
            type="text"
            required
            maxLength={180}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title"
            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100"
          />
          <div className="grid sm:grid-cols-2 gap-3">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as VaultCategory)}
              className="rounded-lg border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100"
            >
              {VAULT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <input
              type="text"
              maxLength={200}
              value={tagsRaw}
              onChange={(e) => setTagsRaw(e.target.value)}
              placeholder="Tags (comma-separated)"
              className="rounded-lg border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100"
            />
          </div>
          <textarea
            rows={8}
            maxLength={20000}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Capture ideas, study notes, lessons, or personal goals privately..."
            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090B] px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100"
          />
          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#C8A24A] text-zinc-950 text-xs font-semibold hover:bg-[#d6b25e] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {editingNote ? 'Update Note' : 'Save to Vault'}
          </button>
        </form>

        <div className="lg:col-span-7 space-y-3">
          {filteredNotes.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800 p-10 text-center text-sm text-zinc-500">
              No vault entries match your filter yet.
            </div>
          ) : (
            filteredNotes.map((note) => (
              <div
                key={note.id}
                className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111114] p-5 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-mono text-[#9A7420] dark:text-[#C8A24A]">
                      {note.category}
                      {note.tags.length > 0 ? ` · ${note.tags.join(' / ')}` : ''}
                    </p>
                    <h3 className="text-lg font-display font-semibold text-zinc-900 dark:text-white mt-0.5">
                      {note.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => void updateVaultNote(note.id, { pinned: !note.pinned })}
                      aria-label="Pin note"
                      className={`p-1.5 rounded cursor-pointer ${
                        note.pinned ? 'text-[#C8A24A]' : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <Pin className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => startEdit(note)}
                      aria-label="Edit note"
                      className="p-1.5 text-zinc-400 hover:text-white cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => void deleteVaultNote(note.id)}
                      aria-label="Delete note"
                      className="p-1.5 text-zinc-400 hover:text-red-400 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">
                  {note.content}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
