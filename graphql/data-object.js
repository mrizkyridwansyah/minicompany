const {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLList,
  GraphQLString,
  GraphQLFloat,
  GraphQLID,
  GraphQLInt,
  GraphQLBoolean,
} = require("graphql");

const { getMultipleData, getSingleData } = require("../login/get-data");

const Employee = require("../hris/models/schema/employee");
const Contract = require("../hris/models/schema/employee-contract");
const Salary = require("../hris/models/schema/employee-salary");
const Activity = require("../hris/models/schema/employee-activity");
const Reimburse = require("../hris/models/schema/employee-reimburse");
const Approval = require("../hris/models/schema/approval");

const RoleAccess = require("../login/models/schema/role-access");
const Menu = require("../login/models/schema/menu");

const Candidate = require("../reqruitment/models/schema/candidate");
const Job = require("../reqruitment/models/schema/job");
const JobApplication = require("../reqruitment/models/schema/application");
const Question = require("../reqruitment/models/schema/question");
const Option = require("../reqruitment/models/schema/option");

const divisionObj = new GraphQLObjectType({
  name: "Division",
  description: "Get Data Division",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLID) },
    name: { type: GraphQLNonNull(GraphQLString) },
    employee: {
      type: employeeObj,
      resolve: async (division) => {
        return await Employee.find({ division: division.name });
      },
    },
  }),
});

const departmentObj = new GraphQLObjectType({
  name: "Department",
  description: "Get Data Department",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLID) },
    name: { type: GraphQLNonNull(GraphQLString) },
    employee: {
      type: employeeObj,
      resolve: async (department) => {
        return await Employee.find({ department: department.name });
      },
    },
  }),
});

const employeeObj = new GraphQLObjectType({
  name: "Employee",
  description: "Get Data Employee",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLID) },
    employeeId: { type: GraphQLNonNull(GraphQLID) },
    identityNumber: { type: GraphQLNonNull(GraphQLString) },
    email: { type: GraphQLNonNull(GraphQLString) },
    name: { type: GraphQLNonNull(GraphQLString) },
    placeOfBirth: { type: GraphQLNonNull(GraphQLString) },
    dateOfBirth: {
      type: GraphQLNonNull(GraphQLString),
      resolve: (employee) => {
        return employee.dateOfBirth.toISOString().split("T")[0];
      },
    },
    identityAddress: { type: GraphQLNonNull(GraphQLString) },
    identitySubDistrict: { type: GraphQLNonNull(GraphQLString) },
    identityDistricts: { type: GraphQLNonNull(GraphQLString) },
    identityProvince: { type: GraphQLNonNull(GraphQLString) },
    nationality: { type: GraphQLNonNull(GraphQLString) },
    phoneNumber: { type: GraphQLNonNull(GraphQLString) },
    status: { type: GraphQLNonNull(GraphQLString) },
    activeFlag: { type: GraphQLNonNull(GraphQLBoolean) },
    division: { type: GraphQLNonNull(GraphQLString) },
    department: { type: GraphQLNonNull(GraphQLString) },
    jobTitle: { type: GraphQLNonNull(GraphQLString) },
    accountBank: { type: GraphQLNonNull(GraphQLString) },
    usernameEmployee: { type: GraphQLString },
    // photo: { type: GraphQLString },
    // cv: { type: GraphQLString },
    joinDate: {
      type: GraphQLNonNull(GraphQLString),
      resolve: (employee) => {
        return employee.joinDate.toISOString().split("T")[0];
      },
    },
    resignDate: {
      type: GraphQLString,
      resolve: (employee) => {
        return employee.resignDate !== null
          ? employee.resignDate.toISOString().split("T")[0]
          : null;
      },
    },
    createAt: {
      type: GraphQLString,
      resolve: (employee) => {
        return employee.createAt.toISOString().split("T")[0];
      },
    },
    contracts: {
      type: GraphQLList(employeeContractObj),
      resolve: async (employee) => {
        return await Contract.find({ employeeId: employee.id });
      },
    },
    salaries: {
      type: GraphQLList(employeeSalaryObj),
      resolve: async (employee) => {
        return await Salary.find({ employeeId: employee.id });
      },
    },
    activities: {
      type: GraphQLList(employeeActivityObj),
      resolve: async (employee) => {
        return await Activity.find({ employeeId: employee.id });
      },
    },
  }),
});

const employeeContractObj = new GraphQLObjectType({
  name: "Contract",
  description: "Get Data Employee Contract",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLID) },
    employeeId: { type: GraphQLNonNull(GraphQLID) },
    employee: {
      type: employeeObj,
      resolve: async (contract) => {
        return await Employee.findById(contract.employeeId);
      },
    },
    dateFrom: {
      type: GraphQLNonNull(GraphQLString),
      resolve: (contract) => {
        return contract.dateFrom.toISOString().split("T")[0];
      },
    },
    dateUntil: {
      type: GraphQLNonNull(GraphQLString),
      resolve: (contract) => {
        return contract.dateUntil.toISOString().split("T")[0];
      },
    },
    activeFlag: { type: GraphQLNonNull(GraphQLBoolean) },
    createAt: {
      type: GraphQLNonNull(GraphQLString),
      resolve: (contract) => {
        return contract.createAt.toISOString().split("T")[0];
      },
    },
    updateAt: {
      type: GraphQLNonNull(GraphQLString),
      resolve: (contract) => {
        return contract.createAt.toISOString().split("T")[0];
      },
    },
  }),
});

const employeeSalaryObj = new GraphQLObjectType({
  name: "Salary",
  description: "Get Data Employee Salary",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLID) },
    employeeId: { type: GraphQLNonNull(GraphQLID) },
    employee: {
      type: employeeObj,
      resolve: async (salary) => {
        return await Employee.findById(salary.employeeId);
      },
    },
    job: { type: GraphQLNonNull(GraphQLString) },
    division: { type: GraphQLNonNull(GraphQLString) },
    department: { type: GraphQLNonNull(GraphQLString) },
    amount: { type: GraphQLNonNull(GraphQLFloat) },
    activeFlag: { type: GraphQLNonNull(GraphQLBoolean) },
    createAt: {
      type: GraphQLNonNull(GraphQLString),
      resolve: (salary) => {
        return salary.createAt.toISOString().split("T")[0];
      },
    },
  }),
});

const employeeActivityObj = new GraphQLObjectType({
  name: "Activity",
  description: "Get Data Employee Activity",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLID) },
    employeeId: { type: GraphQLNonNull(GraphQLID) },
    name: { type: GraphQLNonNull(GraphQLString) },
    employee: {
      type: employeeObj,
      resolve: async (activity) => {
        return await Employee.findById(activity.employeeId);
      },
    },
    type: { type: GraphQLNonNull(GraphQLString) },
    dateFrom: {
      type: GraphQLNonNull(GraphQLString),
      resolve: (activity) => {
        return activity.dateFrom.toISOString().split("T")[0];
      },
    },
    dateUntil: {
      type: GraphQLNonNull(GraphQLString),
      resolve: (activity) => {
        return activity.dateUntil.toISOString().split("T")[0];
      },
    },
    status: { type: GraphQLNonNull(GraphQLString) },
    notes: { type: GraphQLNonNull(GraphQLString) },
    createAt: {
      type: GraphQLNonNull(GraphQLString),
      resolve: (activity) => {
        return activity.createAt.toISOString().split("T")[0];
      },
    },
    updateAt: {
      type: GraphQLNonNull(GraphQLString),
      resolve: (activity) => {
        return activity.updateAt.toISOString().split("T")[0];
      },
    },
    reimburse: {
      type: GraphQLList(employeeReimburseObj),
      resolve: async (activity) => {
        return await Reimburse.find({ activityId: activity.id });
      },
    },
  }),
});

const employeeReimburseObj = new GraphQLObjectType({
  name: "Reimburse",
  description: "Get Data Employee Reimburse",
  fields: () => ({
    id: { type: GraphQLID },
    activityId: { type: GraphQLString },
    activity: {
      type: employeeActivityObj,
      resolve: async (reimburse) => {
        return await Activity.findById(reimburse.activityId);
      },
    },
    employeeId: { type: GraphQLID },
    employee: {
      type: employeeObj,
      resolve: async (reimburse) => {
        return await Employee.findById(reimburse.employeeId);
      },
    },
    amount: { type: GraphQLFloat },
    status: { type: GraphQLString },
    file: { type: GraphQLString },
    createAt: {
      type: GraphQLString,
      resolve: (reimburse) => {
        return reimburse.createAt.toISOString().split("T")[0];
      },
    },
    updateAt: {
      type: GraphQLString,
      resolve: (reimburse) => {
        return reimburse.updateAt.toISOString().split("T")[0];
      },
    },
    approvals: {
      type: GraphQLList(approvalObj),
      resolve: async (reimburse) => {
        return await Approval.find({ activityId: reimburse.activityId });
      },
    },
  }),
});

const refApprovalObj = new GraphQLObjectType({
  name: "RefApproval",
  description: "Get Data Approval Reference",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLID) },
    userId: { type: GraphQLNonNull(GraphQLString) },
    level: { type: GraphQLNonNull(GraphQLInt) },
  }),
});

const approvalObj = new GraphQLObjectType({
  name: "Approval",
  description: "Get Data Approval",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLID) },
    activityId: { type: GraphQLNonNull(GraphQLString) },
    activity: {
      type: employeeActivityObj,
      resolve: async (approval) => {
        return await Activity.findById(approval.activityId);
      },
    },
    userId: { type: GraphQLNonNull(GraphQLString) },
    level: { type: GraphQLNonNull(GraphQLInt) },
    approvedFlag: { type: GraphQLBoolean },
    approvedDate: {
      type: GraphQLString,
      resolve: (approval) => {
        return approval.approvedDate
          ? approval.approvedDate.toISOString().split("T")[0]
          : null;
      },
    },
    notes: { type: GraphQLNonNull(GraphQLString) },
  }),
});

const user = new GraphQLObjectType({
  name: "User",
  description: "Get Data User",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLID) },
    username: { type: GraphQLNonNull(GraphQLString) },
    name: { type: GraphQLNonNull(GraphQLString) },
    email: { type: GraphQLNonNull(GraphQLString) },
    role: { type: GraphQLNonNull(GraphQLString) },
    activeFlag: { type: GraphQLNonNull(GraphQLBoolean) },
    employeeId: { type: GraphQLString },
    access: {
      type: GraphQLList(accessRole),
      resolve: (user) => {
        const search = { role: user.role };
        return getMultipleData(RoleAccess, search);
      },
    },
  }),
});

const role = new GraphQLObjectType({
  name: "Role",
  description: "Get Data Role",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLID) },
    name: { type: GraphQLNonNull(GraphQLString) },
  }),
});

const app = new GraphQLObjectType({
  name: "App",
  description: "Get Data App",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLID) },
    name: { type: GraphQLNonNull(GraphQLString) },
    desc: { type: GraphQLNonNull(GraphQLString) },
    menu: {
      type: GraphQLList(menu),
      resolve: async (app) => {
        const search = { app: app.name };
        return await getMultipleData(Menu, search);
      },
    },
  }),
});

const accessRole = new GraphQLObjectType({
  name: "AccessRole",
  description: "Get Access Data Role",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLID) },
    role: { type: GraphQLNonNull(GraphQLString) },
    app: { type: GraphQLNonNull(GraphQLString) },
    menu: { type: GraphQLNonNull(GraphQLString) },
  }),
});

const menu = new GraphQLObjectType({
  name: "Menu",
  description: "Get Data Menu",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLID) },
    name: { type: GraphQLNonNull(GraphQLString) },
    app: { type: GraphQLNonNull(GraphQLString) },
    entryPoint: { type: GraphQLNonNull(GraphQLString) },
    logo: { type: GraphQLString },
    parent: { type: GraphQLString },
  }),
});

const candidateObj = new GraphQLObjectType({
  name: "Candidate",
  description: "Get Data Candidate",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLID) },
    identityNumber: { type: GraphQLNonNull(GraphQLString) },
    email: { type: GraphQLNonNull(GraphQLString) },
    name: { type: GraphQLNonNull(GraphQLString) },
    placeOfBirth: { type: GraphQLNonNull(GraphQLString) },
    dateOfBirth: {
      type: GraphQLNonNull(GraphQLString),
      resolve: (candidate) => {
        return candidate.dateOfBirth.toISOString().split("T")[0];
      },
    },
    identityAddress: { type: GraphQLNonNull(GraphQLString) },
    identitySubDistrict: { type: GraphQLNonNull(GraphQLString) },
    identityDistricts: { type: GraphQLNonNull(GraphQLString) },
    identityProvince: { type: GraphQLNonNull(GraphQLString) },
    nationality: { type: GraphQLNonNull(GraphQLString) },
    phoneNumber: { type: GraphQLNonNull(GraphQLString) },
    photo: { type: GraphQLString },
    cv: { type: GraphQLString },
    status: { type: GraphQLNonNull(GraphQLString) },
    createAt: {
      type: GraphQLNonNull(GraphQLString),
      resolve: (candidate) => {
        return candidate.createAt.toISOString().split("T")[0];
      },
    },
    application: {
      type: GraphQLList(jobApplicationObj),
      resolve: (candidate) => {
        const search = { candidateId: candidate.id };
        return getMultipleData(JobApplication, search);
      },
    },
  }),
});

const jobObj = new GraphQLObjectType({
  name: "Job",
  description: "Get Data Job",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLID) },
    title: { type: GraphQLNonNull(GraphQLString) },
    desc: { type: GraphQLNonNull(GraphQLString) },
    requirement: { type: GraphQLNonNull(GraphQLString) },
    type: { type: GraphQLNonNull(GraphQLString) },
    minRate: { type: GraphQLNonNull(GraphQLFloat) },
    maxRate: { type: GraphQLNonNull(GraphQLFloat) },
    closedFlag: { type: GraphQLNonNull(GraphQLString) },
    publishedFlag: { type: GraphQLNonNull(GraphQLString) },
    createAt: {
      type: GraphQLNonNull(GraphQLString),
      resolve: (job) => {
        return job.createAt.toISOString().split("T")[0];
      },
    },
    updateAt: {
      type: GraphQLNonNull(GraphQLString),
      resolve: (job) => {
        return job.updateAt.toISOString().split("T")[0];
      },
    },
    applications: {
      type: GraphQLList(jobApplicationObj),
      resolve: (job) => {
        const search = { jobId: job.id };
        return getMultipleData(JobApplication, search);
      },
    },
    questions: {
      type: GraphQLList(questionObj),
      resolve: (job) => {
        const search = { jobId: job.id };
        return getMultipleData(Question, search);
      },
    },
  }),
});

const jobApplicationObj = new GraphQLObjectType({
  name: "JobApplication",
  description: "Get Data Job Application",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLID) },
    jobId: { type: GraphQLNonNull(GraphQLID) },
    candidateId: { type: GraphQLNonNull(GraphQLID) },
    status: { type: GraphQLNonNull(GraphQLString) },
    onlineResult: { type: GraphQLNonNull(GraphQLFloat) },
    onlineResultDate: { type: GraphQLNonNull(GraphQLString) },
    notes: { type: GraphQLNonNull(GraphQLString) },
    createAt: {
      type: GraphQLNonNull(GraphQLString),
      resolve: (application) => {
        return application.createAt.toISOString().split("T")[0];
      },
    },
    updateAt: {
      type: GraphQLNonNull(GraphQLString),
      resolve: (application) => {
        return application.updateAt.toISOString().split("T")[0];
      },
    },
    updateBy: { type: GraphQLNonNull(GraphQLString) },
    job: {
      type: jobObj,
      resolve: (application) => {
        return getSingleData(Job, application.jobId);
      },
    },
    candidate: {
      type: candidateObj,
      resolve: (application) => {
        return getSingleData(Candidate, application.candidateId);
      },
    },
  }),
});

const questionObj = new GraphQLObjectType({
  name: "Question",
  description: "Get Data Question",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLID) },
    jobId: { type: GraphQLNonNull(GraphQLID) },
    type: { type: GraphQLNonNull(GraphQLString) },
    desc: { type: GraphQLNonNull(GraphQLString) },
    weight: { type: GraphQLNonNull(GraphQLInt) },
    createAt: {
      type: GraphQLNonNull(GraphQLString),
      resolve: (question) => {
        return question.createAt.toISOString().split("T")[0];
      },
    },
    updateAt: {
      type: GraphQLNonNull(GraphQLString),
      resolve: (question) => {
        return question.updateAt.toISOString().split("T")[0];
      },
    },
    createBy: { type: GraphQLNonNull(GraphQLString) },
    updateBy: { type: GraphQLNonNull(GraphQLString) },
    job: {
      type: jobObj,
      resolve: (question) => {
        return getSingleData(Job, question.jobId);
      },
    },
    options: {
      type: GraphQLList(optionObj),
      resolve: (question) => {
        const search = { questionId: question.id };
        return getMultipleData(Option, search);
      },
    },
  }),
});

const optionObj = new GraphQLObjectType({
  name: "Option",
  description: "Get Data Option",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLID) },
    questionId: { type: GraphQLNonNull(GraphQLID) },
    desc: { type: GraphQLNonNull(GraphQLString) },
    value: { type: GraphQLNonNull(GraphQLBoolean) },
    createAt: {
      type: GraphQLNonNull(GraphQLString),
      resolve: (opt) => {
        return opt.createAt.toISOString().split("T")[0];
      },
    },
    updateAt: {
      type: GraphQLNonNull(GraphQLString),
      resolve: (opt) => {
        return opt.updateAt.toISOString().split("T")[0];
      },
    },
    createBy: { type: GraphQLNonNull(GraphQLString) },
    updateBy: { type: GraphQLNonNull(GraphQLString) },
    question: {
      type: questionObj,
      resolve: (option) => {
        return getSingleData(Question, option.questionId);
      },
    },
  }),
});

const testObj = new GraphQLObjectType({
  name: "OnlineTestDetail",
  description: "Get Data Online Test Result",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLID) },
    applicationId: { type: GraphQLNonNull(GraphQLID) },
    application: {
      type: jobApplicationObj,
      resolve: (test) => {
        return getSingleData(JobApplication, test.applicationId);
      },
    },
    questionId: { type: GraphQLNonNull(GraphQLID) },
    question: { type: GraphQLNonNull(GraphQLString) },
    answerId: { type: GraphQLNonNull(GraphQLID) },
    answer: { type: GraphQLNonNull(GraphQLString) },
    value: { type: GraphQLNonNull(GraphQLInt) },
  }),
});

module.exports = {
  divisionObj,
  departmentObj,
  employeeObj,
  employeeContractObj,
  employeeSalaryObj,
  employeeActivityObj,
  employeeReimburseObj,
  refApprovalObj,
  approvalObj,
  user,
  role,
  app,
  accessRole,
  menu,
  questionObj,
  optionObj,
  jobObj,
  jobApplicationObj,
  candidateObj,
  testObj,
};
