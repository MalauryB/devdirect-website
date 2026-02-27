-- =====================================================
-- PREVENT ROLE SELF-CHANGE
-- =====================================================
-- This trigger prevents users from changing their own role
-- via direct profile updates. Role changes should only be
-- performed by database administrators.
-- =====================================================

-- Prevent users from changing their own role
CREATE OR REPLACE FUNCTION prevent_role_self_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    RAISE EXCEPTION 'Cannot change role directly';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prevent_role_change ON profiles;
CREATE TRIGGER prevent_role_change
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_role_self_change();
