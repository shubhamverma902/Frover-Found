'use client';

import { useEffect, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchSeating,
  createTable,
  updateTable,
  deleteTable,
  assignGuest,
  selectSeatingTables,
  selectSeatingGuests,
  selectSeatingStatus,
  selectSeatingMutating,
  selectUnassignedGuests,
} from '@/store/slices/seatingSlice';
import {
  GuestChip,
  GuestPool,
  TableCard,
  AddTableModal,
  EditTableModal,
} from '@/features/seating';
import type { SeatingTable, Guest } from '@/constants/dashboard-pages';

const SeatingPage = () => {
  const dispatch   = useAppDispatch();
  const tables     = useAppSelector(selectSeatingTables);
  const allGuests  = useAppSelector(selectSeatingGuests);
  const unassigned = useAppSelector(selectUnassignedGuests);
  const status     = useAppSelector(selectSeatingStatus);
  const mutating   = useAppSelector(selectSeatingMutating);

  const [showAdd,    setShowAdd]    = useState(false);
  const [editTable,  setEditTable]  = useState<SeatingTable | null>(null);
  const [activeGuest, setActiveGuest] = useState<Guest | null>(null);

  useEffect(() => {
    if (status === 'idle') dispatch(fetchSeating());
  }, [status, dispatch]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor,   { activationConstraint: { delay: 150, tolerance: 5 } })
  );

  const handleDragStart = ({ active }: DragStartEvent) => {
    const guest = allGuests.find(g => g._id === active.id);
    if (guest) setActiveGuest(guest);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveGuest(null);
    if (!over) return;
    const guestId = String(active.id);
    const tableId = over.id === 'pool' ? null : String(over.id);
    dispatch(assignGuest({ guestId, tableId }));
  };

  const guestMap = new Map(allGuests.map(g => [g._id, g]));

  const tableGuests = (t: SeatingTable): Guest[] =>
    t.guestIds.map(id => guestMap.get(id)).filter(Boolean) as Guest[];

  const assignedCount = allGuests.length - unassigned.length;
  const totalSeats    = tables.reduce((s, t) => s + t.capacity, 0);

  const loading = status === 'loading' || status === 'idle';

  return (
    <div className="p-6 lg:p-8 min-h-full">

      {showAdd && (
        <AddTableModal
          saving={mutating}
          onClose={() => setShowAdd(false)}
          onSave={async payload => {
            const result = await dispatch(createTable(payload));
            if (createTable.fulfilled.match(result)) setShowAdd(false);
          }}
        />
      )}

      {editTable && (
        <EditTableModal
          table={editTable}
          saving={mutating}
          onClose={() => setEditTable(null)}
          onSave={async payload => {
            const result = await dispatch(updateTable({ id: editTable._id, ...payload }));
            if (updateTable.fulfilled.match(result)) setEditTable(null);
          }}
          onDelete={async () => {
            const result = await dispatch(deleteTable(editTable._id));
            if (deleteTable.fulfilled.match(result)) setEditTable(null);
          }}
        />
      )}

      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div>
          <p className="text-[10px] font-bold text-[#E4BC62] uppercase tracking-[0.4em] mb-1">Planning</p>
          <h1 className="text-2xl font-black text-[#23292E] dark:text-white">Seating Planner</h1>
          {!loading && (
            <p className="text-xs text-[#23292E]/50 dark:text-[#DDDED9]/40 mt-1">
              {assignedCount} of {allGuests.length} guests seated
              {tables.length > 0 && ` · ${totalSeats} seats across ${tables.length} table${tables.length !== 1 ? 's' : ''}`}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#E4BC62] text-[#23292E] text-[11px] font-black uppercase tracking-[0.25em] hover:bg-[#d4ac52] transition-colors shrink-0"
        >
          <span>+</span> Add Table
        </button>
      </div>

      {loading && (
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 bg-[#23292E] animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-40 bg-[#23292E] animate-pulse" />
            ))}
          </div>
        </div>
      )}

      {!loading && allGuests.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <span className="text-5xl text-[#23292E]/10 dark:text-[#DDDED9]/10">⬡</span>
          <p className="text-sm font-bold text-[#23292E]/40 dark:text-[#DDDED9]/40">No guests added yet</p>
          <p className="text-xs text-[#23292E]/30 dark:text-[#DDDED9]/25">Add guests in the Guest List section first.</p>
        </div>
      )}

      {!loading && allGuests.length > 0 && (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>

          <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6 items-start">

            {/* ── Unassigned pool ── */}
            <div className="lg:sticky lg:top-6">
              <GuestPool guests={unassigned} total={allGuests.length} />
            </div>

            {/* ── Tables grid ── */}
            {tables.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-[#23292E]/10 dark:border-[#DDDED9]/10 gap-3">
                <span className="text-4xl text-[#23292E]/10 dark:text-[#DDDED9]/10">⬡</span>
                <p className="text-sm font-bold text-[#23292E]/30 dark:text-[#DDDED9]/30">No tables yet</p>
                <button
                  type="button"
                  onClick={() => setShowAdd(true)}
                  className="text-xs text-[#E4BC62]/60 underline underline-offset-2 hover:text-[#E4BC62] transition-colors"
                >
                  Add your first table
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {tables.map(t => (
                  <TableCard
                    key={t._id}
                    table={t}
                    guests={tableGuests(t)}
                    onEdit={setEditTable}
                    onUnassign={guestId => dispatch(assignGuest({ guestId, tableId: null }))}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Drag overlay — renders the chip under the cursor while dragging */}
          <DragOverlay dropAnimation={null}>
            {activeGuest && <GuestChip guest={activeGuest} overlay />}
          </DragOverlay>

        </DndContext>
      )}

    </div>
  );
};

export default SeatingPage;
