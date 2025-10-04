import { DeleteAccount } from "./application/usecase/account/delete-account.js"
import { GetAccount } from "./application/usecase/account/get-account.js"
import { Login } from "./application/usecase/account/login.js"
import { Signup } from "./application/usecase/account/signup.js"
import { UpdateAccount } from "./application/usecase/account/update-account.js"
import { ApproveAdoption } from "./application/usecase/adoption/approve-adoption.js"
import { CompleteAdoption } from "./application/usecase/adoption/complete-adoption.js"
import { GetAdoption } from "./application/usecase/adoption/get-adoption.js"
import { GetAdoptionsByPet } from "./application/usecase/adoption/get-adoptions-by-pet.js"
import { RejectAdoption } from "./application/usecase/adoption/reject-adoption.js"
import { RequestAdoption } from "./application/usecase/adoption/request-adoption.js"
import { CreatePet } from "./application/usecase/pet/create-pet.js"
import { DeletePet } from "./application/usecase/pet/delete-pet.js"
import { GetAllPets } from "./application/usecase/pet/get-all.js"
import { GetPet } from "./application/usecase/pet/get-pet.js"
import { UpdatePet } from "./application/usecase/pet/update-pet.js"
import { JwtAccessTokenVerifierAdapter } from "./infra/auth/jwt-access-token-verifier-adapter.js"
import { JwtTokenGeneratorAdapter } from "./infra/auth/jwt-token-generator-adapter.js"
import { RedisCacheAdapter } from "./infra/cache/redis-adapter.js"
import { AccountController } from "./infra/controller/account/account-controller.js"
import { AdoptionController } from "./infra/controller/adoption/adoption-controller.js"
import { PetController } from "./infra/controller/pet/pet-controller.js"
import { BcryptAdapter } from "./infra/crypto/bcrypt-adapter.js"
import { PrismaAdapter } from "./infra/database/prisma-adapter.js"
import { ExpressAdapter } from "./infra/http/express-adapter.js"
import { AccountRepositoryDatabase } from "./infra/repository/account/account-repository.js"
import { AdoptionRepositoryDatabase } from "./infra/repository/adoption/adoption-repository.js"
import { PetRepositoryDatabase } from "./infra/repository/pet/pet-repository.js"
import { MulterPhotoStorageAdapter } from "./infra/storage/multer-photo-storage-adapter.js"

export function buildApp() {
  const databaseConnection = new PrismaAdapter()
  const accountRepository = new AccountRepositoryDatabase(databaseConnection)
  const getAccount = new GetAccount(accountRepository)
  const tokenGenerator = new JwtTokenGeneratorAdapter(
    process.env.JWT_ACCESS_TOKEN_SECRET!,
    process.env.JWT_REFRESH_TOKEN_SECRET!,
    "15m",
    "7d"
  )
  const passwordHasher = new BcryptAdapter()
  const signup = new Signup(accountRepository, passwordHasher, tokenGenerator)
  const deleteAccount = new DeleteAccount(accountRepository)
  const login = new Login(accountRepository, passwordHasher, tokenGenerator)
  const httpServer = new ExpressAdapter()
  const tokenVerifier = new JwtAccessTokenVerifierAdapter(
    process.env.JWT_ACCESS_TOKEN_SECRET!
  )
  const updateAccount = new UpdateAccount(accountRepository, passwordHasher)
  new AccountController(
    httpServer,
    signup,
    getAccount,
    updateAccount,
    deleteAccount,
    tokenVerifier,
    login
  )
  const petRepository = new PetRepositoryDatabase(databaseConnection)
  const photoStorage = new MulterPhotoStorageAdapter()
  const redisUrl =
    process.env.REDIS_URL ?? "redis://default:passwordredis@localhost:6379/0"
  const ttl = Number(process.env.REDIS_TTL_SECONDS ?? "60")
  const cache = new RedisCacheAdapter(redisUrl)
  const createPet = new CreatePet(petRepository, photoStorage, cache)
  const getPet = new GetPet(petRepository)
  const getAllPets = new GetAllPets(petRepository, cache, ttl)
  const deletePet = new DeletePet(petRepository, cache)
  const updatePet = new UpdatePet(petRepository, cache, photoStorage)
  new PetController(
    httpServer,
    createPet,
    tokenVerifier,
    getPet,
    getAllPets,
    deletePet,
    updatePet
  )
  const adoptionRepository = new AdoptionRepositoryDatabase(databaseConnection)
  const requestAdoption = new RequestAdoption(petRepository, adoptionRepository)
  const getAdoption = new GetAdoption(adoptionRepository)
  const approveAdoption = new ApproveAdoption(adoptionRepository)
  const rejectAdoption = new RejectAdoption(adoptionRepository)
  const completeAdoption = new CompleteAdoption(adoptionRepository)
  const getAdoptionsByPet = new GetAdoptionsByPet(adoptionRepository)
  new AdoptionController(
    httpServer,
    tokenVerifier,
    requestAdoption,
    getAdoption,
    approveAdoption,
    rejectAdoption,
    completeAdoption,
    getAdoptionsByPet
  )
  return httpServer
}
