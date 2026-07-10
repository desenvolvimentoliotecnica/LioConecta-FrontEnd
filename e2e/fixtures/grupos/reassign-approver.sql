UPDATE groups SET "ApproverId" = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbb103' WHERE "Name" LIKE 'E2E-GRUPOS%' AND "Status" = 0;
SELECT "Id", "Name", "Status", "ApproverId" FROM groups WHERE "Name" LIKE 'E2E-GRUPOS%';
