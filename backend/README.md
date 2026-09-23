# Backend development

Run `npm run seed:catechist` with a development `DATABASE_URL` to create or
reset the test catechist account:

- Email: `catechist@parish.local`
- Password: `Catechist@123456`

Set `CATECHIST_TEST_EMAIL` and `CATECHIST_TEST_PASSWORD` to use different
credentials. The script refuses to run when `NODE_ENV=production`. The account
must be given an `ACTIVE` teaching assignment by an administrator before class,
session, or attendance data is visible.
