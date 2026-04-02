import { ChevronRight, ChevronDown, Plus, Pencil, Trash2 } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { CategoryDto } from "@/api/catalog/categories"

interface CategoryTreeProps {
  nodes: CategoryDto[]
  selectedId?: string
  onSelect: (category: CategoryDto) => void
  onAddChild: (parent: CategoryDto) => void
  onDelete: (category: CategoryDto) => void
}

export function CategoryTree({
  nodes,
  selectedId,
  onSelect,
  onAddChild,
  onDelete,
}: CategoryTreeProps) {
  return (
    <ul className="space-y-0.5">
      {nodes.map((node) => (
        <CategoryNode
          key={node.id}
          node={node}
          selectedId={selectedId}
          onSelect={onSelect}
          onAddChild={onAddChild}
          onDelete={onDelete}
        />
      ))}
    </ul>
  )
}

interface CategoryNodeProps {
  node: CategoryDto
  selectedId?: string
  onSelect: (category: CategoryDto) => void
  onAddChild: (parent: CategoryDto) => void
  onDelete: (category: CategoryDto) => void
}

function CategoryNode({
  node,
  selectedId,
  onSelect,
  onAddChild,
  onDelete,
}: CategoryNodeProps) {
  const [expanded, setExpanded] = useState(true)
  const hasChildren = node.children.length > 0
  const isSelected = node.id === selectedId
  const canAddChild = node.level < 3

  return (
    <li>
      <div
        className={cn(
          "group flex items-center gap-1 rounded-md px-2 py-1.5 text-sm cursor-pointer",
          isSelected
            ? "bg-primary text-primary-foreground"
            : "hover:bg-accent hover:text-accent-foreground"
        )}
        style={{ paddingLeft: `${(node.level - 1) * 16 + 8}px` }}
        onClick={() => onSelect(node)}
      >
        <button
          className="shrink-0 p-0.5 rounded"
          onClick={(e) => {
            e.stopPropagation()
            setExpanded((v) => !v)
          }}
        >
          {hasChildren ? (
            expanded ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )
          ) : (
            <span className="h-3.5 w-3.5 inline-block" />
          )}
        </button>

        <span className="flex-1 truncate">{node.name}</span>

        {!node.isActive && (
          <span className="text-xs opacity-60">(nieaktywna)</span>
        )}

        <div
          className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          {canAddChild && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              title="Dodaj podkategorię"
              onClick={() => onAddChild(node)}
            >
              <Plus className="h-3 w-3" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            title="Edytuj"
            onClick={() => onSelect(node)}
          >
            <Pencil className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            title="Usuń"
            onClick={() => onDelete(node)}
          >
            <Trash2 className="h-3 w-3 text-destructive" />
          </Button>
        </div>
      </div>

      {hasChildren && expanded && (
        <CategoryTree
          nodes={node.children}
          selectedId={selectedId}
          onSelect={onSelect}
          onAddChild={onAddChild}
          onDelete={onDelete}
        />
      )}
    </li>
  )
}
