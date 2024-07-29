ALTER TABLE deliverables
ADD COLUMN dependency_deliverable_id UUID REFERENCES deliverables(id);